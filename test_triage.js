const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1280, height: 1200 } });
    await page.goto('http://localhost:3000/triage', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: '/Users/kongem/.gemini/antigravity/brain/72241f59-6a8f-4132-bb2c-8cce8a51dbf9/triage_result_preview.png',
      fullPage: false
    });
    console.log('Result screenshot saved successfully!');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Automation error:', err);
    process.exit(1);
  }
})();
