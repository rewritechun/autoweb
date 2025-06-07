import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const screenshotsDir = path.resolve('./screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  const timestamp = Date.now();
  const snap = async (page, step) => {
    const filePath = path.join(screenshotsDir, `${step}-${timestamp}.png`);
    await page.screenshot({ path: filePath });
    console.log(`🖼 截图保存: ${filePath}`);
  };

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1366,768',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1366, height: 768 });

    console.log("🚀 正在打开登录页...");
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle0', timeout: 30000 });
    await snap(page, '01-login-page');

    // 点击“账号密码登录”
    console.log("🔐 点击账号密码登录按钮...");
    await page.waitForSelector('.flex-center.margin-t30 .cursor', { timeout: 10000 });
    const loginButtons = await page.$$('.flex-center.margin-t30 .cursor');
    await loginButtons[0].click();
    await page.waitForTimeout(1000);

    // 输入账号与密码
    console.log("👤 输入账号与密码...");
    await page.type('#el-id-6203-3', '13211012200', { delay: 100 });
    await page.type('#el-id-6203-4', 'Khhly123.', { delay: 100 });
    await snap(page, '02-credentials-input');

    // 第二次点击登录
    console.log("🔓 点击登录按钮...");
    await page.click('.login-but.c-white.font-20');
    await page.waitForTimeout(3000);
    await snap(page, '03-after-login');

    // 关闭弹窗
    const closeBtn = await page.$('button.el-dialog__headerbtn');
    if (closeBtn) {
      console.log("❎ 关闭提示弹窗");
      await closeBtn.click();
    }

    await page.waitForTimeout(1000);

    // 点击“自查自改”
    console.log("📋 进入自查自改...");
    const items = await page.$x("//li[contains(., '自查自改')]");
    if (items.length > 0) {
      await items[0].click();
    } else {
      throw new Error("❌ 找不到‘自查自改’按钮");
    }
    await page.waitForTimeout(2000);
    await snap(page, '04-enter-check');

    // 查找未巡查工单
    console.log("🔍 查找未巡查工单...");
    const rows = await page.$$('tbody tr');
    let filled = true;
    for (const row of rows) {
      const status = await row.$eval('.el-table_3_column_23 .cell', el => el.innerText.trim());
      if (status.includes('未巡查')) {
        filled = false;
        console.log("✅ 找到未巡查工单，点击填报...");
        const btn = await row.$('.el-table_3_column_24 .cell span');
        if (btn) await btn.click();
        break;
      }
    }

    if (filled) {
      console.log("📦 今日已完成，无需重复提交");
      await browser.close();
      return res.status(200).send('✅ 今日已填报，无需重复操作！');
    }

    await page.waitForTimeout(2000);
    await snap(page, '05-ready-to-submit');

    // 点击“提交”按钮
    console.log("📨 点击提交按钮...");
    const submitBtn = await page.$('button.el-button.gd-button-confirm');
    if (submitBtn) await submitBtn.click();
    else throw new Error("❌ 未找到提交按钮");

    await page.waitForTimeout(1500);
    await snap(page, '06-submitted');

    await browser.close();
    res.status(200).send('✅ 工单已成功提交！');

  } catch (err) {
    console.error("🚨 出现错误：", err.message);
    res.status(500).send(`❌ 自动提交失败：${err.message}`);
  }
}
