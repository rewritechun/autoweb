const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  const basePath = '/root/autoweb/auto-ticket/';

  try {
    console.log('🌐 打开登录页面...');
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(10000);
    const s1 = `${basePath}step1_open_page.png`;
    await page.screenshot({ path: s1, fullPage: true });
    console.log(`📸 保存截图：${s1}`);

    console.log('🧭 点击“账号密码登录”标签（XPath）...');
    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);
    const s2 = `${basePath}step2_click_account_login.png`;
    await page.screenshot({ path: s2, fullPage: true });
    console.log(`📸 保存截图：${s2}`);

    console.log('🔐 输入账号密码...');
    const usernameInput = page.locator('input[placeholder="请输入身份证号/手机号"]');
    await usernameInput.waitFor({ timeout: 30000 });
    await usernameInput.click();
    await page.waitForTimeout(1000);
    await usernameInput.fill('13211012200');

    const passwordInput = page.locator('input[placeholder="请输入密码"]');
    await passwordInput.waitFor({ timeout: 30000 });
    await passwordInput.click();
    await page.waitForTimeout(1000);
    await passwordInput.fill('Khhly123.');
    const s3 = `${basePath}step3_filled_credentials.png`;
    await page.screenshot({ path: s3, fullPage: true });
    console.log(`📸 保存截图：${s3}`);

    console.log('🔓 点击登录按钮...');
    const loginButtons = await page.locator('button.login-but').all();
    let clicked = false;
    for (const btn of loginButtons) {
      const text = await btn.innerText();
      if (text.trim() === '登录') {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) throw new Error('未找到第一个“登录”按钮！');
    await page.waitForTimeout(10000);
    const s4 = `${basePath}step4_after_login_click.png`;
    await page.screenshot({ path: s4, fullPage: true });
    console.log(`📸 保存截图：${s4}`);

    console.log('🔁 再次点击最终登录按钮...');
    const finalLoginButtons = await page.locator('button').all();
    let finalClicked = false;
    for (const btn of finalLoginButtons) {
      const text = await btn.innerText();
      if (text.trim() === '登录') {
        await btn.click();
        finalClicked = true;
        break;
      }
    }
    if (!finalClicked) throw new Error('未找到第二个“登录”按钮！');
    await page.waitForTimeout(8000);
    const s4b = `${basePath}step4b_final_login.png`;
    await page.screenshot({ path: s4b, fullPage: true });
    console.log(`📸 保存截图：${s4b}`);

    console.log('❎ 如有弹窗则关闭...');
    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }
    const s5 = `${basePath}step5_after_dialog_close.png`;
    await page.screenshot({ path: s5, fullPage: true });
    console.log(`📸 保存截图：${s5}`);

    console.log('📋 尝试点击侧边栏菜单项“自查自改”...');
    const checkMenuItem = page.locator('li:has-text("自查自改")');
    await checkMenuItem.waitFor({ timeout: 30000 });
    await checkMenuItem.scrollIntoViewIfNeeded();
    await checkMenuItem.click({ force: true });
    await page.waitForTimeout(3000);
    const s6 = `${basePath}step6_after_check_click.png`;
    await page.screenshot({ path: s6, fullPage: true });
    console.log(`📸 保存截图：${s6}`);

    console.log('📄 检查是否有未巡查工单...');
    await page.waitForSelector('table tbody', { timeout: 30000 });
    await page.waitForTimeout(1000);
    const tableScreenshot = `${basePath}step6b_table_loaded.png`;
    await page.screenshot({ path: tableScreenshot, fullPage: true });
    console.log(`📸 保存截图：${tableScreenshot}`);

    const tableRows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const [i, row] of tableRows.entries()) {
      const rowText = await row.textContent();
      console.log(`🔎 第 ${i + 1} 行内容：${rowText?.trim()}`);
      if (rowText.includes('未巡查')) {
        console.log(`🛠️ 第 ${i + 1} 行为“未巡查”，尝试点击“工单填报”按钮...`);

        const fillBtn = row.locator('button:has-text("工单填报")');
        await fillBtn.first().click();
        await page.waitForTimeout(2000);
        const s7 = `${basePath}step7_form_opened.png`;
        await page.screenshot({ path: s7, fullPage: true });
        console.log(`📸 保存截图：${s7}`);

        const submitBtn = page.locator('button:has-text("提交")');
        await submitBtn.waitFor({ timeout: 15000 });
        await submitBtn.click();
        await page.waitForTimeout(2000);
        const s8 = `${basePath}step8_after_submit.png`;
        await page.screenshot({ path: s8, fullPage: true });
        console.log(`📸 保存截图：${s8}`);

        operated = true;
        break;
      }
    }

    if (!operated) {
      console.log('✅ 所有任务已完成，无需操作。');
      const s9 = `${basePath}step9_all_tasks_done.png`;
      await page.screenshot({ path: s9, fullPage: true });
      console.log(`📸 保存截图：${s9}`);
    } else {
      console.log('✅ 已完成工单填报。');
    }
  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    const sErr = `${basePath}error_screenshot.png`;
    await page.screenshot({ path: sErr, fullPage: true });
    console.log(`📸 错误截图已保存：${sErr}`);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
