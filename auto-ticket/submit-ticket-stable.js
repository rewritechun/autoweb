const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');

const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const screenshotName = `screenshot-${timestamp}.png`;
const screenshotPath = `/var/www/html/screenshots/${screenshotName}`;
const screenshotUrl = `http://47.115.59.84/screenshots/${screenshotName}`;

function getChineseDatetime() {
  return now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-');
}

async function sendWxNotification(message) {
  const payload = {
    msgtype: 'markdown',
    markdown: { content: message }
  };
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    console.log('🔔 微信推送返回：', result);
    return result.errcode === 0;
  } catch (err) {
    console.error('❌ 推送失败：', err.message);
    return false;
  }
}

(async () => {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/var/www/html/screenshots/step1_open_page.png', fullPage: true });

    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/var/www/html/screenshots/step2_click_account_login.png', fullPage: true });

    await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
    await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/var/www/html/screenshots/step3_filled_credentials.png', fullPage: true });

    const buttons = await page.locator('button.login-but').all();
    for (const btn of buttons) {
      if ((await btn.innerText()).trim() === '登录') {
        await btn.click();
        break;
      }
    }
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/var/www/html/screenshots/step4_after_login_click.png', fullPage: true });

    const loginBtn = page.locator('button').filter({ hasText: '登录' }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
    }
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/var/www/html/screenshots/step4b_final_login.png', fullPage: true });

    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    const checkMenu = page.locator('li.el-menu-item').filter({ hasText: '自查自改' });
    await checkMenu.first().waitFor({ timeout: 30000 });
    await checkMenu.first().click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/var/www/html/screenshots/step6_after_check_click.png', fullPage: true });

    await page.waitForSelector('table tbody');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/var/www/html/screenshots/step6b_table_loaded.png', fullPage: true });

    const rows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const row of rows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        const btn = row.locator(':text("工单填报")');
        await btn.first().click({ timeout: 10000 });
        await page.waitForTimeout(1000);

        const submit = page.locator('button:has-text("提交")');
        await submit.click({ timeout: 10000 });
        await page.waitForTimeout(2000);

        await page.evaluate(() => window.scrollTo(document.body.scrollWidth, 0));
        await page.screenshot({ path: screenshotPath, fullPage: true });

        operated = true;
        break;
      }
    }

    await page.evaluate(() => window.scrollTo(document.body.scrollWidth, 0));
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const msg = [
      `帅哥早上好｜${getChineseDatetime()}`,
      '',
      '### 📋 自查工单反馈通知',
      '',
      operated
        ? '✅ 所有“未巡查”工单已成功填报！'
        : '✅ 当前无未巡查工单，系统状态正常！',
      '',
      '📸 当前页面截图如下：',
      `![截图](${screenshotUrl})`
    ].join('\n');
    await sendWxNotification(msg);

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    await page.evaluate(() => window.scrollTo(document.body.scrollWidth, 0));
    await page.screenshot({ path: '/var/www/html/screenshots/error_screenshot.png', fullPage: true });

    const msg = [
      `帅哥早上好｜${getChineseDatetime()}`,
      '',
      '❌ 自查流程出错，请检查截图：',
      `![错误截图](http://47.115.59.84/screenshots/error_screenshot.png)`
    ].join('\n');
    await sendWxNotification(msg);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
