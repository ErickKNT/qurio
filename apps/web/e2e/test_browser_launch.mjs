import { chromium } from 'playwright';

async function testLaunch() {
  console.log('Testing launch of Google Chrome / Edge...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('about:blank');
  console.log('Browser launched successfully. Title:', await page.title());
  await browser.close();
  console.log('Browser closed cleanly.');
}

testLaunch().catch((err) => {
  console.error('Launch failed:', err);
  process.exit(1);
});
