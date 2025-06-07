const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true }); 
  const context = await browser.newContext();
  const page = await context.newPage();

  const delay = ms => new Promise(res => setTimeout(res, ms));

  console.log("🚀 启动 Playwright 脚本...");

  // 打开登录页面
  console.log("🌐 打开登录页面...");
  await page.goto('https://gd.119.gov.cn/society/login');
  await delay(1000);

  // 点击“账号密码登录”按钮
  const loginTabs = page.locator('div:has-text("账号密码登录")');
  const tabCount = await loginTabs.count();
  for (let i = 0; i < tabCount; i++) {
    const tab = loginTabs.nth(i);
    if (await tab.isVisible()) {
      await tab.click();
      console.log("🔐 点击账号密码登录");
      break;
    }
  }
  await delay(1000);

  // 输入账号和密码
  await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
  await delay(500);
  await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
  await delay(500);

  // 点击登录
  await page.click('button:has-text("登录")');
  console.log("🔓 点击登录");
  await page.waitForLoadState('networkidle');
  await delay(2000);

  // 检查并关闭弹窗
  const closePopup = page.locator('button[aria-label="el.dialog.close"]');
  if (await closePopup.isVisible()) {
    await closePopup.click();
    console.log("🔒 关闭登录后弹窗");
    await delay(1000);
  }

  // 点击“自查自改”按钮
  const selfCheckBtn = page.locator('span:has-text("自查自改")');
  await selfCheckBtn.click();
  console.log("📋 点击自查自改");
  await page.waitForSelector('table');
  await delay(2000);

  // 获取所有未巡查行
  const uninspectedCells = await page.locator('td:has-text("未巡查")').elementHandles();

  if (uninspectedCells.length === 0) {
    console.log("✅ 当前无未巡查工单，无需处理");
  } else {
    console.log(`🚨 检测到 ${uninspectedCells.length} 个未巡查记录，准备处理...`);

    for (const cell of uninspectedCells) {
      const row = await cell.evaluateHandle(td => td.closest('tr'));
      const reportBtn = await row.$('text=工单填报');
      if (reportBtn) {
        await reportBtn.click();
        console.log("✍️ 进入工单填报页面");
        await delay(1000);

        await page.waitForSelector('button:has-text("提交")');
        await delay(500);
        await page.click('button:has-text("提交")');
        console.log("📨 提交工单完成");
        await delay(2000);
      }
    }

    console.log("✅ 所有未巡查工单处理完成");
  }

  await delay(1000);
  await browser.close();
})();
