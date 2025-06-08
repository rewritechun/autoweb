// submit-ticket.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { timeout: 60000 });
    await page.waitForTimeout(3000);

    // 等待“账号密码登录”标签出现（确保 DOM 和 JS 都加载完）
    await page.waitForSelector('text=账号密码登录', { timeout: 20000 });

    // 等待额外时间，确保渲染完成
    await page.waitForTimeout(2000);

    // 截图并输出 base64 到日志
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    const base64 = screenshotBuffer.toString('base64');
    console.log('📷 页面截图（Base64）：');
    console.log(`data:image/png;base64,${base64}`);


    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div.el-tabs__item').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text.includes('账号密码登录')) {
        await tab.click();
        break;
      }
    }
    await page.waitForTimeout(2000);

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 15000 });
    await usernameInput.click();
    await page.waitForTimeout(500);
    await usernameInput.fill('13211012200');
    await page.waitForTimeout(500);

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 15000 });
    await passwordInput.click();
    await page.waitForTimeout(500);
    await passwordInput.fill('Khhly123.');
    await page.waitForTimeout(1000);

    const loginBtn = page.locator('button.login-but', { hasText: '登录' });
    await loginBtn.waitFor({ timeout: 15000 });
    await loginBtn.click();
    await page.waitForTimeout(5000);

    console.log('✅ 登录完成，准备后续操作...');

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
