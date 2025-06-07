import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/chromium-browser', // Render 默认路径
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    const page = await browser.newPage();
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle2' });

    // 点击“账号密码登录”
    await page.waitForSelector('.flex-center.margin-t30 .cursor', { timeout: 10000 });
    const loginButtons = await page.$$('.flex-center.margin-t30 .cursor');
    await loginButtons[0].click();  // 默认点击第一个

    await page.waitForTimeout(1000);

    // 输入账号
    await page.type('#el-id-6203-3', '13211012200', { delay: 100 });

    // 输入密码
    await page.type('#el-id-6203-4', 'Khhly123.', { delay: 100 });

    // 第二次点击登录
    await page.click('.login-but.c-white.font-20');
    await page.waitForTimeout(2000);

    // 关闭弹窗（如果存在）
    const closeBtn = await page.$('button.el-dialog__headerbtn');
    if (closeBtn) await closeBtn.click();

    await page.waitForTimeout(1000);

    // 点击“自查自改”
    const items = await page.$x("//li[contains(., '自查自改')]");
    if (items.length > 0) {
      await items[0].click();
    } else {
      throw new Error("❌ 找不到“自查自改”按钮");
    }

    await page.waitForTimeout(2000);

    // 遍历工单列表，查找“未巡查”
    const rows = await page.$$('tbody tr');
    let found = false;

    for (const row of rows) {
      const statusEl = await row.$('.el-table_3_column_23 .cell');
      const statusText = await page.evaluate(el => el.innerText.trim(), statusEl);

      if (statusText.includes('未巡查')) {
        found = true;

        // 点击“工单填报”按钮
        const reportBtn = await row.$('.el-table_3_column_24 .cell span');
        if (reportBtn) await reportBtn.click();

        await page.waitForTimeout(1500);

        // 提交按钮
        const submitBtn = await page.$('button.el-button.gd-button-confirm');
        if (submitBtn) await submitBtn.click();

        await page.waitForTimeout(1500);
        break;
      }
    }

    await browser.close();

    if (found) {
      return res.status(200).send('✅ 工单已成功提交！');
    } else {
      return res.status(200).send('✅ 今日已填报，无需重复操作！');
    }
  } catch (err) {
    console.error('❌ 错误:', err);
    return res.status(500).send(`❌ 自动提交失败：${err.message}`);
  }
}
