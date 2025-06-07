import puppeteer from 'puppeteer';

export default async function submitTicket(req, res) {
  const { username, password, content } = req.body;

  if (!username || !password || !content) {
    return res.status(400).json({ error: '请提供完整的账号、密码和工单内容。' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 访问登录页
    await page.goto('https://gd.119.gov.cn/society/login', {
      waitUntil: 'networkidle2'
    });

    // 填写账号密码
    await page.type('#username', username);
    await page.type('#password', password);

    // 点击登录
    await Promise.all([
      page.click('#loginBtn'), // 按钮 ID 视实际情况调整
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 登录成功后跳转到工单页面
    await page.goto('https://gd.119.gov.cn/society/ticket', {
      waitUntil: 'networkidle2'
    });

    // 填写工单内容
    await page.type('#ticketContent', content); // 假设这个是工单内容框 ID
    await page.click('#submitBtn'); // 提交按钮 ID 视页面而定

    await browser.close();

    return res.json({ success: true, message: '✅ 工单提交成功' });
  } catch (error) {
    console.error('❌ 自动提交失败:', error);
    return res.status(500).json({ error: '提交过程中发生错误', detail: error.message });
  }
}
