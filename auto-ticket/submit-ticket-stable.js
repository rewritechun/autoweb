const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1200 }
  });
  const page = await context.newPage();

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(60000);
    const screenshot1 = await page.screenshot({ type: 'png' });
    console.log('📷 登录页截图：' + screenshot1.toString('base64'));

    console.log('🧭 点击底部“账号密码登录”链接...');
    await page.locator('text=账号密码登录').click();
    await page.waitForTimeout(60000);
    const screenshot2 = await page.screenshot({ type: 'png' });
    console.log('📷 点击账号密码登录后截图：' + screenshot2.toString('base64'));

    console.log('🔐 提交登录信息...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 60000 });
    await usernameInput.click();
    await usernameInput.fill('你的账号');
    await page.waitForTimeout(1000);

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 60000 });
    await passwordInput.click();
    await passwordInput.fill('你的密码');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("登录")').click();
    await page.waitForTimeout(60000);
    const screenshot3 = await page.screenshot({ type: 'png' });
    console.log('📷 登录后截图：' + screenshot3.toString('base64'));

    console.log('❎ 检查弹窗...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    console.log('📋 点击“自查自改”...');
    await page.locator('text=自查自改').click();
    await page.waitForTimeout(60000);
    const screenshot4 = await page.screenshot({ type: 'png' });
    console.log('📷 自查自改页截图：' + screenshot4.toString('base64'));

    const tableRows = await page.locator('table tbody tr').all();
    let operated = false;
    for (const row of tableRows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        await row.locator('text=工单填报').click();
        await page.waitForTimeout(60000);
        await page.locator('button:has-text("提交")').click();
        await page.waitForTimeout(60000);
        operated = true;
        break;
      }
    }

    if (operated) {
      console.log('✅ 已完成未巡查项填报');
    } else {
      console.log('✅ 所有任务均已完成，无需操作');
    }
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
