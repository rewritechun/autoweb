const { chromium } = require('playwright');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d';

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const screenshotDir = '/var/www/html/screenshots';
const screenshotBaseUrl = 'http://47.115.59.84/screenshots';

function getChineseDatetime() {
  return now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-');
}

async function takeScreenshot(page, step) {
  const filename = `step-${step}-${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  return `${screenshotBaseUrl}/${filename}`;
}

async function sendWxNotification(message) {
  const payload = { msgtype: 'markdown', markdown: { content: message } };
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
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const shot1 = await takeScreenshot(page, '01-login-page');

    const tab = page.locator('xpath=//*[@id="pane-1"]/div/div/div[3]/div/div[1]');
    await tab.waitFor({ timeout: 30000 });
    await tab.click();
    await page.waitForTimeout(3000);
    const shot2 = await takeScreenshot(page, '02-after-click-tab');

    await page.fill('input[placeholder="请输入身份证号/手机号"]', '13211012200');
    await page.fill('input[placeholder="请输入密码"]', 'Khhly123.');
    await page.waitForTimeout(2000);
    const shot3 = await takeScreenshot(page, '03-filled-login-info');

    const loginBtn = page.locator('button').filter({ hasText: '登录' }).first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      await page.waitForTimeout(8000);
    }
    const shot4 = await takeScreenshot(page, '04-after-login');

    const closeBtn = page.locator('button.el-dialog__headerbtn');
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(2000);
    }

    const checkMenu = page.locator('li.el-menu-item').filter({ hasText: '自查自改' });
    await checkMenu.first().waitFor({ timeout: 30000 });
    await checkMenu.first().click();
    await page.waitForTimeout(3000);
    const shot5 = await takeScreenshot(page, '05-enter-check');

    await page.waitForSelector('table tbody');
    await page.waitForTimeout(2000);
    const shot6 = await takeScreenshot(page, '06-table-loaded');

    const rows = await page.locator('table tbody tr').all();
    let operated = false;

    for (const row of rows) {
      const text = await row.textContent();
      if (text.includes('未巡查')) {
        const btn = row.locator(':text("工单填报")');
        await btn.first().click({ timeout: 10000 });
        await page.waitForTimeout(2000);

        const submit = page.locator('button:has-text("提交")');
        await submit.click({ timeout: 10000 });
        await page.waitForTimeout(3000);

        const shot7 = await takeScreenshot(page, '07-submitted-ticket');
        operated = true;
        break;
      }
    }

    const finalShot = await takeScreenshot(page, '08-final-check');
    const msg = [
      `帅哥早上好｜${getChineseDatetime()}`,
      '',
      '### 📋 自查工单反馈通知',
      '',
      operated ? '✅ 所有“未巡查”工单已成功填报！' : '✅ 当前无未巡查工单，系统状态正常！',
      '',
      '📸 当前页面截图如下：',
      `![截图](${finalShot})`
    ].join('\n');
    await sendWxNotification(msg);

  } catch (err) {
    console.error('❌ 执行过程中出错：', err);
    const errShot = await takeScreenshot(page, '99-error');
    const msg = [
      `帅哥早上好｜${getChineseDatetime()}`,
      '',
      '❌ 自查流程出错，请检查截图：',
      `![错误截图](${errShot})`
    ].join('\n');
    await sendWxNotification(msg);
  } finally {
    await browser.close();
    console.log('🛑 脚本执行完毕，浏览器已关闭');
  }
})();
