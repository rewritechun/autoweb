const { chromium } = require('playwright');

(async () => {
  console.log("🚀 启动 Playwright 脚本...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("🌐 打开登录页面...");
  await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  console.log("🧭 点击“账号密码登录”标签...");
  const tabButton = await page.locator('div').filter({ hasText: '账号密码登录' }).first();
  await tabButton.click();
  await page.waitForTimeout(1000);

  console.log("🔐 提交登录信息...");
  await page.click('input[placeholder="请输入身份证号/手机号"]');
  await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
  await page.waitForTimeout(500);

  await page.click('input[placeholder="请输入密码"]');
  await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
  await page.waitForTimeout(500);

  console.log("🔓 点击登录按钮...");
  await page.click('button:has-text("登录")');
  await page.waitForTimeout(3000); // 等待页面切换

  console.log("✅ 登录成功，准备处理弹窗...");
  const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(1000);
    console.log("🧹 已关闭弹窗");
  }

  console.log("🛠️ 点击“自查自改”...");
  await page.click('text=自查自改');
  await page.waitForTimeout(2000);

  console.log("🔍 检查是否存在未巡查项目...");
  const unCheckedRow = await page.locator('tr:has-text("未巡查")').first();
  if (await unCheckedRow.isVisible()) {
    console.log("📌 存在未巡查项目，准备填写...");

    const fillButton = await unCheckedRow.locator('button:has-text("工单填报")').first();
    await fillButton.click();
    await page.waitForTimeout(2000);

    console.log("✍️ 开始填写并提交...");
    const submitBtn = page.locator('button:has-text("提交")');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      console.log("✅ 工单提交成功！");
    } else {
      console.log("⚠️ 未找到提交按钮");
    }
  } else {
    console.log("👍 当前没有未巡查项目，无需操作");
  }

  await browser.close();
  console.log("🎉 脚本执行完毕，浏览器已关闭");
})();
