// auto-ticket/api/submit-ticket.js
import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle2' });

    // 点击“账号密码登录”
    await page.waitForSelector('.flex-center.margin-t30 .cursor', { timeout: 10000 });
    const loginButtons = await page.$$('.flex-center.margin-t30 .cursor');
    await loginButtons[0].click();

    await page.waitForTimeout(1000);

    // 输入账号
    await page.type('#el-id-6203-3', '13211012200', { delay: 100 });

    // 输入密码
    await page.type('#el-id-6203-4', 'Khhly123.', { delay: 100 });

    // 点击登录按钮
    await page.click('.login-but.c-white.font-20');

    await page.waitForTimeout(2000);

    // 关闭提示弹窗
    const closeBtn = await page.$('button.el-dialog__headerbtn');
    if (closeBtn) await closeBtn.click();

    await page.waitForTimeout(1000);

    // 点击“自查自改”
    const items = await page.$x("//li[contains(., '自查自改')]");
    if (items.length > 0) await items[0].click();
    else throw new Error("找不到‘自查自改’按钮");

    await page.waitForTimeout(2000);

    // 获取未填报工单
    const rows = await page.$$('tbody tr');
    let filled = true;
    for (const row of rows) {
      const status = await row.$eval('.el-table_3_column_23 .cell', el => el.innerText.trim());
      if (status.includes('未巡查')) {
        filled = false;
        const btn = await row.$('.el-table_3_column_24 .cell span');
        if (btn) await btn.click();
        break;
      }
    }

    if (filled) {
      await browser.close();
      return res.status(200).send('✅ 今日已填报，无需重复操作！');
    }

    await page.waitForTimeout(1500);

    // 点击“提交”按钮
    const submitBtn = await page.$('button.el-button.gd-button-confirm');
    if (submitBtn) await submitBtn.click();

    await page.waitForTimeout(1500);
    await browser.close();

    res.status(200).send('✅ 工单已成功提交！');
  } catch (err) {
    console.error(err);
    res.status(500).send(`❌ 自动提交失败：${err.message}`);
  }
}

export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 示例：访问某网页（换成你要自动化的页面）
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle2' });

    // 示例：可以继续模拟点击/输入/表单提交等
    // await page.type('#username', '你的用户名');
    // await page.type('#password', '你的密码');
    // await page.click('#loginBtn');

    await browser.close();
    res.status(200).send('✅ 工单流程执行成功');
  } catch (error) {
    console.error('❌ 出错:', error);
    res.status(500).send('❌ 执行失败：' + error.message);
  }
}
