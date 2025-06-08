const { chromium } = require('playwright');
const fetch = require('node-fetch');

// ✅ 企业微信通知函数
async function sendWxNotification(message) {
  const webhook = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';
  const payload = {
    msgtype: 'markdown',
    markdown: {
      content: `### 📋 自查工单脚本通知\n\n${message}\n\n> ⏱️ 执行时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
    }
  };
  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log('🔔 企业微信推送结果：', data);
  } catch (err) {
    console.error('❌ 推送失败：', err.message);
  }
}

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const basePath = '/root/autoweb/auto-ticket/';

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);

    console.log('🧭 点击“账号密码登录”标签...');
    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);

    console.log('🔐 输入账号密码...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 30000 });
    await usernameInput.click();
    await page.waitForTimeout(1000);
    await usernameInput.fill('13211012200');

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 30000 });
    await passwordInput.click();
    await page.waitForTimeout(1000);
    await passwordInput.fill('Khhly123.');

    console.log('🔓 点击登录按钮...');
    const loginButtons = await page.locator('button.login-but').all();
    for (const btn of loginButtons) {
      const text = await btn.innerText();
      if (text.trim() === '登录') {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(10000);

    console.log('🔁 再次点击最终登录按钮...');
    const finalLoginButtons = await page.locator('button').all();
    for (const btn of finalLoginButtons) {
      const text = await btn.innerText();
      if (text.trim() === '登录') {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(8000);

    console.log('❎ 关闭可能弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    console.log('📋 点击“自查自改”菜单...');
    const checkMenuItem = page.locator('li.el-menu-item').filter({ hasText: '自查自改' });
    await checkMenuItem.first().waitFor({ timeout: 30000 });
    await checkMenuItem.first().scrollIntoViewIfNeeded();
    await checkMenuItem.first().click({ force: true });
    await page.waitForTimeout(3000);

    // ✅ 循环自动填报
    while (true) {
      console.log('📄 检查是否有未巡查工单...');
      await page.waitForSelector('table tbody', { timeout: 30000 });
      await page.waitForTimeout(1000);

      const tableRows = await page.locator('table tbody tr').all();
      let operated = false;

      for (const [i, row] of tableRows.entries()) {
        const rowText = await row.textContent();
        console.log(`🔎 第 ${i + 1} 行内容：${rowText?.trim()}`);
        if (rowText.includes('未巡查')) {
          console.log(`🛠️ 第 ${i + 1} 行为“未巡查”，点击“工单填报”...`);

          const fillBtn = row.locator(':text("工单填报")');
          await fillBtn.first().waitFor({ timeout: 15000 });
          await fillBtn.first().click({ force: true });

          await page.waitForTimeout(2000);
          const submitBtn = page.locator('button:has-text("提交")');
          await submitBtn.waitFor({ timeout: 15000 });
          await submitBtn.click();
          await page.waitForTimeout(2000);

          operated = true;
          break;
        }
      }

      if (!operated) {
        console.log('✅ 所有“未巡查”工单已完成。');
        await sendWxNotification("✅ 所有“未巡查”工单已自动填报完毕。");
        break;
      } else {
        console.log('🔄 刷新页面以继续...');
        await page.reload({ waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
      }
    }
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    const sErr = `${basePath}error_screenshot.png`;
    await page.screenshot({ path: sErr, fullPage: true });
    console.log(`📸 错误截图已保存：${sErr}`);
    await sendWxNotification("❌ 脚本执行失败，请查看服务器日志和错误截图。");
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
