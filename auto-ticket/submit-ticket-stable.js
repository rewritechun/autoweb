const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({
    headless: true, // 如需调试可改为 false
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Step 1: 打开登录页面
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(60000);
    await page.screenshot({ path: '/root/autoweb/auto-ticket/step1_open_page.png', fullPage: true });

    // Step 2: 点击“账号密码登录”标签
    console.log('🧭 点击“账号密码登录”标签...');
    const tab = await page.locator('div.el-tabs__item:has-text("账号密码登录")');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: '/root/autoweb/auto-ticket/step2_click_tab.png', fullPage: true });

    // Step 3: 填写账号密码
    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 30000 });
    await usernameInput.click();
    await usernameInput.fill('13211012200');

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 30000 });
    await passwordInput.click();
    await passwordInput.fill('Khhly123.');

    await page.waitForTimeout(60000);
    await page.screenshot({ path: '/root/autoweb/auto-ticket/step3_fill_credentials.png', fullPage: true });

    const loginBtn = page.locator('button.login-but:has-text("登录")');
    await loginBtn.waitFor({ timeout: 30000 });
    await loginBtn.click();

    await page.waitForTimeout(60000);
    await page.screenshot({ path: '/root/autoweb/auto-ticket/step4_after_login.png', fullPage: true });

    // Step 4: 关闭弹窗（如果存在）
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // Step 5: 点击“自查自改”
    console.log('📋 点击“自查自改”...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(60000);
    await page.screenshot({ path: '/root/autoweb/auto-ticket/step5_after_click_check.png', fullPage: true });

    // Step 6: 填报工单
    const rows = await page.locator('table tbody tr').all();
    let operated = false;
    for (const row of rows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        console.log('📝 发现“未巡查”任务，开始填报...');
        const fillBtn = await row.locator('text=工单填报');
        await fillBtn.click();
        await page.waitForTimeout(3000);

        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.waitFor({ timeout: 10000 });
        await submitBtn.click();
        await page.waitForTimeout(3000);
        operated = true;
        break;
      }
    }

    if (!operated) {
      console.log('✅ 所有任务已完成，无需操作。');
    } else {
      console.log('✅ 成功完成一次工单填报。');
    }

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
