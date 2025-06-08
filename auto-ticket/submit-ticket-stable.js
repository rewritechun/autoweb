const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const screenshotName = 'screenshot.png';
const screenshotPath = `/var/www/html/screenshots/${screenshotName}`;
const screenshotUrl = `http://47.115.59.84/screenshots/${screenshotName}`;
const webhook = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';

async function sendWxNotification(message) {
  const payload = {
    msgtype: 'markdown',
    markdown: {
      content: `### 📋 自查工单反馈通知\n\n${message}\n\n> 🕒 ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
    }
  };

  try {
    const res = await fetch(webhook, {
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
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

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

        await page.screenshot({ path: screenshotPath, fullPage: true });
        const message = [
          "✅ 所有“未巡查”工单已成功填报！",
          `📸 当前页面截图如下：`,
          `![截图](${screenshotUrl})`
        ].join('\n\n');

        if (await sendWxNotification(message)) {
          fs.unlinkSync(screenshotPath);
          console.log('🧹 截图已删除');
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
    const errorMsg = [
      `❌ 脚本执行失败，错误截图如下：`,
      `![错误截图](${screenshotUrl})`
    ].join('\n\n');

    if (await sendWxNotification(errorMsg)) {
      fs.unlinkSync(screenshotPath);
      console.log('🧹 错误截图已删除');
    }
  } finally {
    await browser.close();
    console.log('🛑 浏览器关闭，脚本结束');
  }
})();
