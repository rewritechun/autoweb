const { chromium } = require('playwright');

(async () => {
  console.log("🚀 启动 Playwright 脚本...");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🌐 打开登录页面...");
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // 等待页面完全渲染

    console.log("🧭 点击“账号密码登录”标签...");
    const tabs = await page.locator('text=账号密码登录');
    await tabs.first().click();
    await page.waitForTimeout(1000);

    console.log("🔐 提交登录信息...");
    await page.click('input[placeholder="请输入身份证号/手机号"]');
    await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');

    await page.click('input[placeholder="请输入密码"]');
    await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');

    await page.waitForTimeout(1000);
    await page.click('button:has-text("登录")');

    await page.waitForNavigation({ waitUntil: 'networkidle' });
    await page.waitForTimeout(3000); // 页面加载缓冲

    console.log("✅ 登录成功，关闭弹窗...");
    const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log("🛠️ 点击“自查自改”...");
    const checkButton = page.locator('text=自查自改');
    await checkButton.click();
    await page.waitForTimeout(2000);

    console.log("🔍 检查是否存在“未巡查”工单...");
    const rows = await page.locator('table').locator('tr:has-text("未巡查")');
    const count = await rows.count();

    if (count > 0) {
      console.log(`📋 发现 ${count} 项未巡查，开始填报...`);
      const firstRow = rows.first();

      // 点击“填报”按钮
      const reportButton = firstRow.locator('button:has-text("填报")');
      await reportButton.click();
      await page.waitForTimeout(2000);

      // 假设这里你知道需要填写的内容（如果有输入框你要继续补充）
      const submitBtn = page.locator('button:has-text("提交")');
      await submitBtn.click();
      await page.waitForTimeout(2000);

      console.log("✅ 工单已成功提交！");
    } else {
      console.log("✔️ 所有工单均已完成，无需操作。");
    }
  } catch (error) {
    console.error("❌ 执行过程中出错：", error);
  } finally {
    await browser.close();
  }
})();
