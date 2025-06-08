const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.baidu.com', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/var/www/html/screenshots/screenshot.png', fullPage: true });
  await browser.close();
})();
