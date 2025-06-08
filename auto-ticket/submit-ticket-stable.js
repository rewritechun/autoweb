const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const basePath = '/root/autoweb/auto-ticket/';

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);
    await page.screenshot({ path: `${basePath}step1_open_page.png`, fullPage: true });

    console.log('🧭 点击“账号密码登录”标签（XPath）...');
    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${basePath}step2_click_account_login.png`, fullPage: true });

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
    await page.screenshot({ path: `${basePath}step3_filled_credentials.png`, fullPage: true });

    console.log('🔓 点击登录按钮...');
    const loginBtn = page.locator('button.login-but', { hasText: '登录' });
    await loginBtn.waitFor({ timeout: 10000 });
    await loginBtn.click();
    await page.waitForTimeout(10000);
    await page.screenshot({ path: `${basePath}step4_after_login_click.png`, fullPage: true });

    console.log('❎ 如有弹窗则关闭...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.screenshot({ path: `${basePath}step5_after_dialog_close.png`, fullPage: true });

    console.log('📋 点击“自查自改”菜单...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${basePath}step6_after_check_click.png`, fullPage: true });

    console.log('📄 检查是否有未巡查工单...');
    const tableRows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const row of tableRows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        console.log('发现“未巡查”工单，点击填报...');
        const fillBtn = await row.locator('text=工单填报');
        await fillBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${basePath}step7_form_opened.png`, fullPage: true });

        console.log('📝 点击提交按钮...');
        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${basePath}step8_after_submit.png`, fullPage: true });

        operated = true;
        break;
      }
    }

    if (!operated) {
      console.log('✅ 所有任务已完成，无需操作。');
      await page.screenshot({ path: `${basePath}step9_all_tasks_done.png`, fullPage: true });
    } else {
      console.log('✅ 已完成工单填报。');
    }
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    await page.screenshot({ path: `${basePath}error_screenshot.png`, fullPage: true });
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
