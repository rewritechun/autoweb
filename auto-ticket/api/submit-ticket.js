import puppeteer from 'puppeteer';

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
