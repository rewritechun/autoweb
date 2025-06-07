const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { timeout: 60000 });
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div:has-text("账号密码登录")').all();
    if (tabs.length > 0) {
      await tabs[0].click();
      await page.waitForTimeout(2000);
    } else {
      throw new Error('未找到账号密码登录标签');
    }

    console.log('🔐 提交登录信息...');
    const inputAccount = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await inputAccount.waitFor({ state: 'visible', timeout: 10000 });
    await inputAccount.click();
    await page.waitForTimeout(300);
    await inputAccount.fill('13211012200');

    const inputPassword = page.locator('input[placeholder="请输入密码"]');
    await inputPassword.waitFor({ state: 'visible', timeout: 10000 });
    await inputPassword.click();
    await page.waitForTimeout(300);
    await inputPassword.fill('Khhly123.');

    const loginBtn = page.locator('button:has-text("登录")');
    await loginBtn.waitFor({ state: 'visible', timeout: 10000 });
    await loginBtn.click();
    await page.waitForTimeout(5000); // 登录后跳转

    console.log('🧹 检查是否有弹窗...');
    const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
    if (await closeBtn.isVisible({ timeout: 3000 })) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('🛠️ 点击“自查自改”按钮...');
    const checkBtn = page.locator('text=自查自改');
    await checkBtn.waitFor({ state: 'visible', timeout: 10000 });
    await checkBtn.click();
    await page.waitForTimeout(3000);

    console.log('🔍 查找未巡查工单...');
    const rows = await page.locator('tr:has-text("未巡查")');
    const count = await rows.count();

    if (count > 0) {
      console.log(`📌 发现 ${count} 条未巡查记录，开始填报...`);
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const fillBtn = row.locator('text=工单填报');
        if (await fillBtn.isVisible({ timeout: 3000 })) {
          await fillBtn.click();
          await page.waitForTimeout(1500);
          const submitBtn = page.locator('button:has-text("提交")');
          if (await submitBtn.isVisible({ timeout: 3000 })) {
            await submitBtn.click();
            await page.waitForTimeout(2000);
          }
        }
      }
    } else {
      console.log('✅ 当前无未巡查工单，无需操作。');
    }

    console.log('🎉 脚本执行完毕。');
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
  }
})();
