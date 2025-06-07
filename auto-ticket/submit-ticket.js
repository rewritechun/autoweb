const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log("🚀 启动 Playwright 脚本...");
  await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'domcontentloaded' });
  console.log("🌐 打开登录页面...");

  // 点击“账号密码登录”标签
  const pwdLoginBtn = page.locator('text=账号密码登录');
  await pwdLoginBtn.first().click();
  await page.waitForTimeout(1500);

  // 填写账号和密码
  await page.getByPlaceholder('请输入身份证号/手机号').click();
  await page.getByPlaceholder('请输入身份证号/手机号').fill('13211012200');
  await page.waitForTimeout(500);
  await page.getByPlaceholder('请输入密码').click();
  await page.getByPlaceholder('请输入密码').fill('Khhly123.');
  await page.waitForTimeout(500);

  // 点击“登录”按钮
  await page.click('button:has-text("登录")');
  console.log("🔐 提交登录信息...");
  await page.waitForTimeout(5000);

  // 关闭弹窗
  const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    console.log("❎ 已关闭弹窗");
    await page.waitForTimeout(1000);
  }

  // 点击“自查自改”
  await page.click('text=自查自改');
  console.log("📋 进入自查自改模块...");
  await page.waitForTimeout(3000);

  // 查找未巡查的工单行
  const unfinished = await page.locator('tr:has(td:text("未巡查"))').first();

  if (await unfinished.isVisible()) {
    console.log("🔍 检测到未巡查工单，准备填报...");
    const fillBtn = unfinished.locator('text=工单填报');
    await fillBtn.click();
    await page.waitForTimeout(2000);

    // 点击提交
    const submitBtn = page.locator('button:has-text("提交")');
    await submitBtn.click();
    console.log("✅ 工单已提交");

  } else {
    console.log("✔️ 所有工单已完成，无需处理");
  }

  await browser.close();
  console.log("🎉 自动化流程已完成");

})().catch((err) => {
  console.error("❌ 执行过程中出错：", err);
});
