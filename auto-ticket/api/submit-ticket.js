import puppeteer from 'puppeteer';

async function main() {
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle2' });

    // 点击“账号密码登录”
    await page.waitForXPath("//div[contains(text(), '账号密码登录')]");
    const [loginTab] = await page.$x("//div[contains(text(), '账号密码登录')]");
    if (loginTab) {
      await loginTab.click();
      await page.waitForTimeout(300);
    }

    // 输入账号
    await page.waitForSelector('#el-id-6203-3');
    await page.waitForTimeout(300);
    await page.type('#el-id-6203-3', '13211012200', { delay: 80 });

    // 输入密码
    await page.waitForSelector('#el-id-6203-4');
    await page.waitForTimeout(300);
    await page.type('#el-id-6203-4', 'Khhly123.', { delay: 80 });

    // 第一次点击“登录”
    await page.waitForSelector('.login-but.c-white');
    await page.waitForTimeout(500);
    await page.click('.login-but.c-white');

    // 第二次点击“登录”
    await page.waitForSelector('.login-but.c-white.font-20');
    await page.waitForTimeout(500);
    await page.click('.login-but.c-white.font-20');

    // 等待登录跳转完成
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    // 关闭弹窗（如果存在）
    const closeBtn = await page.$('.el-dialog__headerbtn');
    if (closeBtn) {
      await page.waitForTimeout(300);
      await closeBtn.click();
    }

    // 点击“自查自改”菜单
    await page.waitForXPath("//li[contains(., '自查自改')]");
    const [menuItem] = await page.$x("//li[contains(., '自查自改')]");
    if (menuItem) {
      await page.waitForTimeout(500);
      await menuItem.click();
    }

    // 等待工单列表加载
    await page.waitForTimeout(2000);

    // 遍历工单查找“未巡查”
    const rows = await page.$$('tr');

    for (const row of rows) {
      const statusText = await row.evaluate(el => {
        const span = el.querySelector('span.c-theme');
        return span ? span.innerText.trim() : null;
      });

      if (statusText === '未巡查') {
        const reportBtn = await row.$('span.weight.c-theme.cursor');
        if (reportBtn) {
          await page.waitForTimeout(500);
          await reportBtn.click();
          console.log('✅ 已点击未巡查工单');
          break;
        }
      }
    }

    // 点击“提交”按钮
    await page.waitForSelector('.el-button.gd-button-confirm', { timeout: 10000 });
    await page.waitForTimeout(800);
    await page.click('.el-button.gd-button-confirm');

    await browser.close();
    console.log('✅ 工单已自动提交');
    process.exit(0);
  } catch (err) {
    console.error('❌ 工单提交失败：', err.message);
    process.exit(1);
  }
}

main();
