const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 打开登录页
    await page.goto('https://gd.119.gov.cn/society/login', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // 输入账号和密码
    await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
    await page.waitForTimeout(1000);
    await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
    await page.waitForTimeout(1000);

    // 点击“登录”按钮
    await page.click('button:has-text("登录")');
    await page.waitForTimeout(4000);

    // 关闭可能弹出的弹窗
    const closeBtn = await page.$('button[aria-label="el.dialog.close"]');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(1000);
    }

    // 点击“自查自改”
    await page.click('text=自查自改');
    await page.waitForTimeout(3000);

    // 查找“未巡查”行
    const uncompletedRows = await page.$$('//tr[.//span[contains(text(), "未巡查")]]');

    if (uncompletedRows.length === 0) {
      console.log('全部已完成，无需处理。');
    } else {
      for (const row of uncompletedRows) {
        const fillBtn = await row.$('text=工单填报');
        if (fillBtn) {
          await fillBtn.click();
          await page.waitForTimeout(2000);

          // 提交表单
          const submitBtn = await page.$('text=提交');
          if (submitBtn) {
            await submitBtn.click();
            await page.waitForTimeout(3000);
          }
        }
      }
    }

    await browser.close();
    process.exit(0); // 正常退出
  } catch (error) {
    console.error('执行过程中出错：', error);
    await browser.close();
    process.exit(1); // 错误退出
  }
})();
