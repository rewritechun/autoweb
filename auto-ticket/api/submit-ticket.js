const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle2' });

    // 点击“账号密码登录”
    await page.waitForSelector('.flex-center .font-20.c-theme');
    const buttons = await page.$$('.flex-center .font-20.c-theme');
    await buttons[0].click();
    await page.waitForTimeout(500);

    // 输入账号密码
    await page.type('#el-id-6203-3', '13211012200', { delay: 100 });
    await page.type('#el-id-6203-4', 'Khhly123.', { delay: 100 });

    // 再次点击“登录”按钮
    await page.click('.login-but.c-white.font-20');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // 关闭弹窗
    const closeBtn = await page.$('button.el-dialog__headerbtn');
    if (closeBtn) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }

    // 点击“自查自改”
    await page.waitForSelector('li.el-menu-item');
    const menuItems = await page.$$('li.el-menu-item');
    for (const item of menuItems) {
      const text = await item.evaluate(node => node.innerText.trim());
      if (text.includes('自查自改')) {
        await item.click();
        break;
      }
    }
    await page.waitForTimeout(1000);

    // 🟡 检查是否已提交
    const status = await page.$eval('td.el-table_3_column_23 span', el => el.innerText.trim());

    if (status.includes('已完成')) {
      await browser.close();
      return res.status(200).send('✅ 今日已填报，无需重复操作');
    }

    // ✅ 若状态为“未巡查”则点击“工单填报”
    const reportBtns = await page.$x("//span[contains(text(),'工单填报')]");
    if (reportBtns.length > 0) {
      await reportBtns[0].click();
    } else {
      await browser.close();
      return res.status(200).send('⚠️ 未找到工单填报按钮');
    }

    await page.waitForTimeout(1000);

    // 点击“提交”按钮
    const submitBtn = await page.$('button.el-button.gd-button-confirm');
    if (submitBtn) {
      await submitBtn.click();
    } else {
      await browser.close();
      return res.status(200).send('⚠️ 未找到提交按钮');
    }

    await page.waitForTimeout(1000);
    await browser.close();

    return res.status(200).send('✅ 工单已成功提交');
  } catch (err) {
    await browser.close();
    return res.status(500).send(`❌ 操作失败: ${err.message}`);
  }
};
