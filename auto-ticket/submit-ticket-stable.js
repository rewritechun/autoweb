const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

async function sendWxNotification(message) {
  const webhook = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';
  const payload = {
    msgtype: 'markdown',
    markdown: {
      content: `### 📋 自查工单反馈通知\n\n${message}\n\n> ⏱️ ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
    }
  };
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('🔔 微信推送返回：', await res.json());
  } catch (err) {
    console.error('❌ 推送失败：', err.message);
  }
}

async function uploadScreenshot(path) {
  const form = new FormData();
  form.append('smfile', fs.createReadStream(path));

  try {
    const res = await fetch('https://sm.ms/api/v2/upload', {
      method: 'POST',
      body: form,
    });
    const data = await res.json();
    if (data.success) {
      return data.data.url;
    } else {
      console.error('❌ 图床上传失败：', data.message);
      return null;
    }
  } catch (err) {
    console.error('❌ 上传截图出错：', err.message);
    return null;
  }
}

(async () => {
  console.log('🚀 启动脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const tmpPath = '/tmp/screenshot.png';

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);

    console.log('🧭 点击账号密码登录标签...');
    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);

    console.log('🔐 输入账号密码...');
    await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
    await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
    await page.waitForTimeout(1000);

    console.log('🔓 点击登录...');
    const buttons = await page.locator('button.login-but').all();
    for (const btn of buttons) {
      if ((await btn.innerText()).trim() === '登录') {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(10000);

    console.log('🔁 再次确认登录...');
    const loginBtn = page.locator('button').filter({ hasText: '登录' }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
    }
    await page.waitForTimeout(8000);

    console.log('❎ 检查弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('📋 点击“自查自改”菜单...');
    const checkMenu = page.locator('li.el-menu-item').filter({ hasText: '自查自改' });
    await checkMenu.first().waitFor({ timeout: 30000 });
    await checkMenu.first().click();
    await page.waitForTimeout(3000);

    while (true) {
      console.log('📄 查找未巡查项...');
      await page.waitForSelector('table tbody');
      await page.waitForTimeout(1000);

      const rows = await page.locator('table tbody tr').all();
      let operated = false;

      for (const row of rows) {
        const text = await row.textContent();
        if (text.includes('未巡查')) {
          const btn = row.locator(':text("工单填报")');
          await btn.first().click({ timeout: 10000 });
          await page.waitForTimeout(1000);

          const submit = page.locator('button:has-text("提交")');
          await submit.click({ timeout: 10000 });
          await page.waitForTimeout(2000);

          operated = true;
          break;
        }
      }

      if (!operated) {
        console.log('✅ 无未巡查项，准备截图...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        await page.screenshot({ path: tmpPath, fullPage: true });
        const imageUrl = await uploadScreenshot(tmpPath);

        if (imageUrl) {
          await sendWxNotification([
            "✅ 所有“未巡查”工单已成功填报！",
            `📸 页面截图如下：\n\n![截图](${imageUrl})`,
            `🔗 [点击查看原图](${imageUrl})`
          ].join('\n\n'));
        } else {
          await sendWxNotification("✅ 所有工单已完成，但截图上传失败，请手动确认。");
        }
        break;
      } else {
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    console.error('❌ 错误：', err);
    await page.screenshot({ path: tmpPath });
    const imageUrl = await uploadScreenshot(tmpPath);
    if (imageUrl) {
      await sendWxNotification(`❌ 脚本执行失败！\n\n📸 错误截图如下：\n\n![错误截图](${imageUrl})`);
    } else {
      await sendWxNotification("❌ 脚本出错，截图上传失败，请登录服务器查看问题。");
    }
  } finally {
    await browser.close();
    console.log('🛑 浏览器关闭，脚本结束');
  }
})();
