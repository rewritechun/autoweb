const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 1024 } });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(30000);

    const screenshot1 = await page.screenshot();
    console.log('📷 登录页截图（Base64）:', screenshot1.toString('base64').slice(0, 500));

    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div.el-tabs__item').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text.includes('账号密码登录')) {
        await tab.click();
        break;
      }
    }
    await page.waitForTimeout(30000);

    const screenshot2 = await page.screenshot();
    console.log('📷 登录方式切换后截图:', screenshot2.toString('base64').slice(0, 500));

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    const passwordInput = page.locator('input[placeholder="请输入密码"]');

    await usernameInput.waitFor({ timeout: 15000 });
    await usernameInput.click();
    await usernameInput.fill('13211012200');
    await page.waitForTimeout(30000);

    await passwordInput.waitFor({ timeout: 15000 });
    await passwordInput.click();
    await passwordInput.fill('Khhly123.');
    await page.waitForTimeout(30000);

    const screenshot3 = await page.screenshot();
    console.log('📷 登录信息填写后截图:', screenshot3.toString('base64').slice(0, 500));

    const loginBtn = page.locator('button.login-but');
    await loginBtn.waitFor({ timeout: 15000 });
    await loginBtn.click();
    await page.waitForTimeout(30000);

    console.log('✅ 登录已尝试，等待跳转或后续处理...');
    const screenshot4 = await page.screenshot();
    console.log('📷 登录后截图:', screenshot4.toString('base64').slice(0, 500));

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
