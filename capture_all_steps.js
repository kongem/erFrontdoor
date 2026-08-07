const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 1100 } });
    const page = await context.newPage();

    // 1. Navigate to /triage
    await page.goto('http://localhost:3000/triage', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Reset triage to start at Step 1 fresh
    const resetBtn = await page.$('button:has-text("Start New Triage")');
    if (resetBtn) {
      await resetBtn.click();
      await page.waitForTimeout(500);
    }

    // Capture Step 1: Guardian Info
    await page.fill('input[placeholder="e.g. Maria Santos"]', 'Sarah Jenkins');
    await page.fill('input[placeholder="e.g. M5G 1X8"]', 'M5G 1X8');
    await page.fill('input[placeholder="(416) 555-0199"]', '(416) 555-0199');
    await page.screenshot({
      path: '/Users/kongem/.gemini/antigravity/brain/72241f59-6a8f-4132-bb2c-8cce8a51dbf9/step1_guardian.png',
      fullPage: false
    });
    console.log('Step 1 screenshot saved.');

    // Click Next to Step 2
    await page.click('button[type="submit"]');
    await page.waitForTimeout(600);

    // Step 2: Child Info
    await page.fill('input[placeholder="e.g. Liam"]', 'Leo');
    await page.screenshot({
      path: '/Users/kongem/.gemini/antigravity/brain/72241f59-6a8f-4132-bb2c-8cce8a51dbf9/step2_child.png',
      fullPage: false
    });
    console.log('Step 2 screenshot saved.');

    // Test Back button retention (Step 2 -> Step 1 -> Step 2)
    const backBtn = await page.$('button:has-text("Back to Step 1")');
    if (backBtn) {
      await backBtn.click();
      await page.waitForTimeout(400);
      // Verify value still present
      const nameVal = await page.inputValue('input[placeholder="e.g. Maria Santos"]');
      console.log('Verified Step 1 retained value:', nameVal);
      // Go forward again
      await page.click('button[type="submit"]');
      await page.waitForTimeout(400);
    }

    // Step 2 submit -> Step 3
    await page.click('button[type="submit"]');
    await page.waitForTimeout(600);

    // Step 3: Symptoms & Red Flags
    const redFlagCards = await page.$$('.cursor-pointer');
    if (redFlagCards.length > 1) {
      await redFlagCards[1].click(); // Severe Breathing Trouble
    }
    await page.screenshot({
      path: '/Users/kongem/.gemini/antigravity/brain/72241f59-6a8f-4132-bb2c-8cce8a51dbf9/step3_symptoms.png',
      fullPage: false
    });
    console.log('Step 3 screenshot saved.');

    // Submit Triage -> Step 4 Result View
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Capture Step 4 Result View
    await page.screenshot({
      path: '/Users/kongem/.gemini/antigravity/brain/72241f59-6a8f-4132-bb2c-8cce8a51dbf9/triage_result_screen.png',
      fullPage: false
    });
    console.log('Step 4 Triage Result screenshot saved successfully!');

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Automation error:', err);
    process.exit(1);
  }
})();
