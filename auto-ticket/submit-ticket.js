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
    await page.waitForTimeout(1000);

    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div:has-text("账号密码登录")').all();
    await tabs[0].click(); // 通常第一个是正确的 tab
    await page.waitForTimeout(1000);

    console.log('🔐 提交登录信息...');
    const inputs = await page.locator('input');
    await inputs.nth(0).click();
    await page.waitForTimeout(300);
    await inputs.nth(0).fill('13211012200');
    await page.waitForTimeout(300);

    await inputs.nth(1).click();
    await page.waitForTimeout(300);
    await inputs.nth(1).fill('Khhly123.');
    await page.waitForTimeout(500);

    await page.locator('button:has-text("登录")').click();
    await page.waitForTimeout(3000);

    console.log('🧹 关闭弹窗（如有）...');
    const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
    if (await closeBtn.isVisible({ timeout: 2000 })) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('🛠️ 点击“自查自改”...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(2000);

    console.log('🔎 查找“未巡查”状态...');
    const rows = await page.locator('tr:has-text("未巡查")');
    const count = await rows.count();

    if (count > 0) {
      console.log(`📌 发现 ${count} 条未巡查记录，开始填报...`);
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        const fillBtn = await row.locator('text=工单填报');
        if (await fillBtn.isVisible()) {
          await fillBtn.click();
          await page.waitForTimeout(1000);
          const submitBtn = await page.locator('button:has-text("提交")');
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(1000);
          }
        }
      }
    } else {
      console.log('✅ 当前无“未巡查”项，无需操作。');
    }

    console.log('🎉 脚本执行完成，准备退出。');
  } catch (error) {
    console.error('❌ 执行过程中出错：', error);
  } finally {
    await browser.close();
  }
})();
