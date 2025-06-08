const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');

const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';

// ⏰ 生成时间戳
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const screenshotName = `screenshot-${timestamp}.png`;
const screenshotPath = `/var/www/html/screenshots/${screenshotName}`;
const screenshotUrl = `http://47.115.59.84/screenshots/${screenshotName}`;

async function sendWxNotification(message) {
  const payload = {
    msgtype: 'markdown',
    markdown: {
      content: message
    }
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log('🔔 微信推送返回：', result);
    return result.errcode === 0;
  } catch (err) {
    console.error('❌ 推送失败：', err.message);
    return false;
  }
}

(async () => {
  console.log('🚀 启动脚本...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('🌐 访问登录页...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);

    console.log('🧭 点击“账号密码登录”标签...');
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

    console.log('🔁 确认再次登录...');
    const loginBtn = page.locator('button').filter({ hasText: '登录' }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
    }
    await page.waitForTimeout(8000);

    console.log('❎ 处理弹窗...');
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
        console.log('✅ 无未巡查项，截图...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);

        await page.screenshot({ path: screenshotPath, fullPage: true });

        const msg = [
          "### 📋 自查工单反馈通知",
          "",
          "✅ 所有“未巡查”工单已成功填报！",
          "",
          "📸 当前页面截图如下：",
          `![截图](${screenshotUrl})`,
          "",
          `🕒 ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
        ].join('\n');

        if (await sendWxNotification(msg)) {
          setTimeout(() => {
            fs.unlink(screenshotPath, err => {
              if (err) console.error('❌ 删除截图失败：', err);
              else console.log('🧹 截图已删除');
            });
          }, 60000); // 延迟60秒删除
        }
        break;
      } else {
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    console.error('❌ 错误：', err);
    await page.screenshot({ path: screenshotPath });

    const errMsg = [
      "### ❌ 自查工单执行失败",
      "",
      `📸 错误截图如下：`,
      `![错误截图](${screenshotUrl})`,
      "",
      `🕒 ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
    ].join('\n');

    if (await sendWxNotification(errMsg)) {
      setTimeout(() => {
        fs.unlink(screenshotPath, err => {
          if (err) console.error('❌ 删除截图失败：', err);
          else console.log('🧹 错误截图已删除');
        });
      }, 60000);
    }
  } finally {
    await browser.close();
    console.log('🛑 浏览器关闭，脚本结束');
  }
})();
