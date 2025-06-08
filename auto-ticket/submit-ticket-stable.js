const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'load' });
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step1_open_page.png', fullPage: true });

    console.log('🧭 点击“账号密码登录”标签...');
    const pwdLoginTab = page.locator('text=账号密码登录');
    await pwdLoginTab.waitFor({ timeout: 30000 });
    await pwdLoginTab.click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step2_clicked_tab.png', fullPage: true });

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 30000 });
    await usernameInput.click();
    await usernameInput.fill('13211012200');

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 30000 });
    await passwordInput.click();
    await passwordInput.fill('Khhly123.');

    await page.screenshot({ path: 'step3_filled_form.png', fullPage: true });

    const loginBtn = page.locator('button:has-text("登录")');
    await loginBtn.waitFor({ timeout: 30000 });
    await loginBtn.click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step4_logged_in.png', fullPage: true });

    console.log('📋 点击“自查自改”...');
    const checkBtn = page.locator('text=自查自改');
    await checkBtn.waitFor({ timeout: 30000 });
    await checkBtn.click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: 'step5_check_list.png', fullPage: true });

    const rows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const row of rows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        const fillBtn = row.locator('text=工单填报');
        await fillBtn.click();
        await page.waitForTimeout(3000);
        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.waitFor({ timeout: 15000 });
        await page.screenshot({ path: 'step6_fill_ticket.png', fullPage: true });
        await submitBtn.click();
        await page.waitForTimeout(3000);
        operated = true;
        break;
      }
    }

    if (operated) {
      console.log('✅ 已完成工单填报。');
    } else {
      console.log('✅ 所有任务已完成，无需操作。');
    }

  } catch (error) {
    console.error('❌ 执行过程中出错：', error);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
