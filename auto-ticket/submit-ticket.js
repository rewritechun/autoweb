const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { timeout: 60000 });

    // 延迟确保页面加载
    await page.waitForTimeout(3000);

    console.log('🧭 点击“账号密码登录”标签...');
    const tabLoc = page.locator('div:has-text("账号密码登录")').nth(0);
    await tabLoc.waitFor({ state: 'visible', timeout: 10000 });
    await tabLoc.click();
    await page.waitForTimeout(2000);

    console.log('🔐 提交登录信息...');

    // 输入账号
    const userInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await userInput.waitFor({ state: 'visible', timeout: 10000 });
    await userInput.click();
    await userInput.fill('13211012200');
    await page.waitForTimeout(1000);

    // 输入密码
    const pwdInput = page.locator('input[placeholder="请输入密码"]');
    await pwdInput.waitFor({ state: 'visible', timeout: 10000 });
    await pwdInput.click();
    await pwdInput.fill('Khhly123.');
    await page.waitForTimeout(1000);

    // 点击登录按钮（精确范围）
    const loginBtns = page.locator('.login-box .login-but');
    if (await loginBtns.count() > 0) {
      await loginBtns.first().click();
    } else {
      throw new Error('❌ 未找到登录按钮');
    }

    // 等待页面跳转
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(3000);

    console.log('✅ 登录成功，处理后续操作...');

    // 关闭弹窗（如果存在）
    const closeBtn = page.locator('button[aria-label="el.dialog.close"]');
    if (await closeBtn.isVisible({ timeout: 5000 })) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // 点击“自查自改”
    console.log('📝 点击“自查自改”按钮...');
    const zczgBtn = page.locator('text=自查自改');
    await zczgBtn.waitFor({ state: 'visible', timeout: 10000 });
    await zczgBtn.click();
    await page.waitForTimeout(3000);

    // 查找是否存在“未巡查”记录
    const unPatrolled = page.locator('td:has-text("未巡查")');
    if (await unPatrolled.count() > 0) {
      console.log('📌 发现未巡查记录，点击工单填报...');
      const fillButton = unPatrolled.first().locator('..').locator('button:has-text("工单填报")');
      await fillButton.click();
      await page.waitForTimeout(2000);

      const submitButton = page.locator('button:has-text("提交")');
      await submitButton.waitFor({ state: 'visible', timeout: 10000 });
      await submitButton.click();
      console.log('✅ 工单提交成功');
    } else {
      console.log('✅ 无未巡查项，无需操作');
    }

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
