import { chromium } from '@playwright/test';

async function main() {
  console.log('🚀 启动 Playwright 脚本...');
  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();
  console.log('🌐 打开登录页面...');
  await page.goto('https://gd.119.gov.cn/society/login', { waitUntil: 'networkidle' });

  // 点击“账号密码登录”
  const loginTab = await page.locator('div:has-text("账号密码登录")');
  if (await loginTab.isVisible()) {
    await loginTab.click();
    await page.waitForTimeout(300);
  }

  // 输入账号
  await page.fill('#el-id-6203-3', '13211012200');
  await page.waitForTimeout(300);

  // 输入密码
  await page.fill('#el-id-6203-4', 'Khhly123.');
  await page.waitForTimeout(300);

  // 点击两次“登录”
  const firstLogin = page.locator('.login-but.c-white');
  if (await firstLogin.isVisible()) {
    await firstLogin.click();
    await page.waitForTimeout(500);
  }

  const secondLogin = page.locator('.login-but.c-white.font-20');
  if (await secondLogin.isVisible()) {
    await secondLogin.click();
    await page.waitForTimeout(500);
  }

  // 等待跳转完成
  await page.waitForLoadState('networkidle');

  // 关闭弹窗
  const closeBtn = page.locator('.el-dialog__headerbtn');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(300);
  }

  // 点击“自查自改”
  const selfCheck = page.locator('li:has-text("自查自改")');
  if (await selfCheck.isVisible()) {
    await selfCheck.click();
    await page.waitForTimeout(1000);
  }

  // 遍历工单查找“未巡查”
  const rows = await page.locator('tr').all();
  for (const row of rows) {
    const text = await row.textContent();
    if (text.includes('未巡查')) {
      const reportBtn = await row.locator('span.weight.c-theme.cursor');
      if (await reportBtn.isVisible()) {
        await reportBtn.click();
        console.log('✅ 已点击未巡查工单');
        break;
      }
    }
  }

  // 点击“提交”
  const submitBtn = page.locator('.el-button.gd-button-confirm');
  await submitBtn.waitFor({ timeout: 10000 });
  await page.waitForTimeout(800);
  await submitBtn.click();

  console.log('✅ 工单已自动提交');
  await browser.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ 提交失败：', err.message);
  process.exit(1);
});
