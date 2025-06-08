// submit-ticket.js
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step1-login-page.png', fullPage: true });

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
    await page.screenshot({ path: 'step2-click-tab.png', fullPage: true });

    console.log('🔐 提交登录信息...');
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
    await page.screenshot({ path: 'step3-filled-credentials.png', fullPage: true });

    const loginBtn = page.locator('button.login-but', { hasText: '登录' });
    await loginBtn.waitFor({ timeout: 10000 });
    await loginBtn.click();
    await page.waitForTimeout(10000);
    await page.screenshot({ path: 'step4-after-login-click.png', fullPage: true });

    console.log('❎ 关闭弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: 'step5-after-dialog-close.png', fullPage: true });

    console.log('📋 点击“自查自改”...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'step6-after-check-click.png', fullPage: true });

    const tableRows = await page.locator('table tbody tr').all();
    let operated = false;
    for (const row of tableRows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        const fillBtn = await row.locator('text=工单填报');
        await fillBtn.click();
        await page.waitForTimeout(2000);
        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.click();
        await page.waitForTimeout(2000);
        operated = true;
        break;
      }
    }

    if (!operated) {
      console.log('✅ 所有任务已完成，无需操作。');
    } else {
      console.log('✅ 已完成工单填报。');
    }
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
