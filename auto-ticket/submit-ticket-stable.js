// submit-ticket.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
  });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(60000); // 等待页面加载

    // 截图保存
    const buffer1 = await page.screenshot({ fullPage: true });
    fs.writeFileSync('step1_login_page.png', buffer1);
    console.log('📷 已保存截图 step1_login_page.png');

    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div.el-tabs__item').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text.includes('账号密码登录')) {
        await tab.click();
        break;
      }
    }
    await page.waitForTimeout(60000);

    const buffer2 = await page.screenshot({ fullPage: true });
    fs.writeFileSync('step2_clicked_tab.png', buffer2);
    console.log('📷 已保存截图 step2_clicked_tab.png');

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 30000 });
    await usernameInput.fill('13211012200');
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 30000 });
    await passwordInput.fill('Khhly123.');
    await page.waitForTimeout(1000);

    const loginBtn = page.locator('button.login-but');
    await loginBtn.waitFor({ timeout: 30000 });
    await loginBtn.click();
    await page.waitForTimeout(10000);

    const buffer3 = await page.screenshot({ fullPage: true });
    fs.writeFileSync('step3_filled_login.png', buffer3);
    console.log('📷 已保存截图 step3_filled_login.png');

    // 后续逻辑可以继续接着添加

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
