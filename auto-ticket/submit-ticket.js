const { chromium } = require('playwright');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--start-maximized']
  });

  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 }
  });

  const page = await context.newPage();

  async function waitAndSnap(label) {
    console.log(`⏳ 等待 60 秒 [${label}]...`);
    await page.waitForTimeout(60000);
    const base64 = (await page.screenshot({ fullPage: true })).toString('base64');
    console.log(`📷 [${label}] 截图：data:image/png;base64,${base64}`);
  }

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login');
    await waitAndSnap('登录页面');

    console.log('🧭 点击“账号密码登录”标签...');
    const tabs = await page.locator('div.el-tabs__item').all();
    for (const tab of tabs) {
      const text = await tab.textContent();
      if (text.includes('账号密码登录')) {
        await tab.click();
        break;
      }
    }
    await waitAndSnap('点击账号密码登录后');

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]').first();
    await usernameInput.waitFor({ timeout: 15000 });
    await usernameInput.click();
    await usernameInput.fill('13211012200');

    const passwordInput = page.locator('input[placeholder="请输入密码"]').first();
    await passwordInput.waitFor({ timeout: 15000 });
    await passwordInput.click();
    await passwordInput.fill('Khhly123.');

    const loginBtn = page.locator('button.login-but', { hasText: '登录' });
    await loginBtn.waitFor({ timeout: 15000 });
    await loginBtn.click();
    await waitAndSnap('登录后页面');

    console.log('❎ 尝试关闭弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    await waitAndSnap('关闭弹窗后');

    console.log('📋 点击“自查自改”...');
    const checkBtn = page.locator('text=自查自改');
    await checkBtn.waitFor({ timeout: 15000 });
    await checkBtn.click();
    await waitAndSnap('点击自查自改后');

    console.log('🔍 检查是否有“未巡查”的记录...');
    const rows = await page.locator('table tbody tr');
    const count = await rows.count();

    let operated = false;

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        console.log(`📝 第 ${i + 1} 条为“未巡查”，开始填报...`);
        const fillBtn = row.locator('text=工单填报');
        await fillBtn.click();
        await waitAndSnap(`工单填报 - 第 ${i + 1} 条`);

        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.waitFor({ timeout: 10000 });
        await submitBtn.click();
        await waitAndSnap(`提交完成 - 第 ${i + 1} 条`);
        operated = true;
      }
    }

    if (!operated) {
      console.log('✅ 所有任务均已巡查，无需操作。');
    } else {
      console.log('✅ 所有“未巡查”记录已成功填报并提交。');
    }

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    const base64 = (await page.screenshot({ fullPage: true })).toString('base64');
    console.log(`📷 ❌ 错误时截图：data:image/png;base64,${base64}`);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
