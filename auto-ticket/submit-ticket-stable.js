const fs = require('fs');
const { chromium } = require('playwright');
const fetch = require('node-fetch');

const webhookUrl = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=7b179414-a827-46f4-8f1b-1004d209795d'; // 替换成你的机器人地址

// 生成唯一文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const screenshotName = `screenshot-${timestamp}.png`;
const screenshotPath = `/var/www/html/screenshots/${screenshotName}`;
const screenshotUrl = `http://47.115.59.84/screenshots/${screenshotName}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.baidu.com', { waitUntil: 'networkidle' });

    // 👇 拍摄截图并保存
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // 👇 发送微信机器人通知（带图床图片链接）
    const markdownMsg = {
      msgtype: "markdown",
      markdown: {
        content: `✅ 自查流程完成，无未巡查项\n![截图展示](${screenshotUrl})`
      }
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(markdownMsg)
    });

    console.log("✅ 微信推送返回：", await res.json());
  } catch (err) {
    console.error("❌ 脚本异常：", err);
  } finally {
    await browser.close();

    // 🧹 可选：延时删除截图
    setTimeout(() => {
      fs.unlink(screenshotPath, (err) => {
        if (err) console.error("❌ 删除截图失败：", err);
        else console.log("🧹 截图已删除");
      });
    }, 30 * 1000); // 延迟30秒删除截图
  }
})();
