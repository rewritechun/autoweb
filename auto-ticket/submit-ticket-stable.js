const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
  });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'load', timeout: 60000 });
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step1_open_page.png', fullPage: true });

    console.log('🧭 点击“账号密码登录”标签...');
    const accountTab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await accountTab.waitFor({ timeout: 15000 });
    await page.screenshot({ path: 'step2_before_click_login_tab.png', fullPage: true });
    await accountTab.click({ force: true });
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step3_after_click_login_tab.png', fullPage: true });

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

    await page.screenshot({ path: 'step4_filled_credentials.png', fullPage: true });

    const loginBtn = page.locator('button.login-but');
    await loginBtn.waitFor({ timeout: 10000 });
    await loginBtn.click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step5_after_login.png', fullPage: true });

    console.log('❎ 检查是否有弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible({ timeout: 5000 })) {
      await closeBtn.click();
      await page.waitForTimeout(3000);
    }

    console.log('📋 点击“自查自改”...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step6_zichazigai_list.png', fullPage: true });

    const rows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const row of rows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        const fillBtn = row.locator('text=工单填报');
        await fillBtn.click();
        await page.waitForTimeout(60000);

        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.waitFor({ timeout: 30000 });
        await submitBtn.click();
        await page.waitForTimeout(3000);

        operated = true;
        console.log('✅ 已完成一条工单填报。');
        break; // 只处理一条，避免冲突
      }
    }

    if (!operated) {
      console.log('✅ 所有工单都已巡查，无需处理。');
    }

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
