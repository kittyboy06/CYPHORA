import { test, expect } from '@playwright/test';

test.describe('Round 1 Copy Output & Intra-OS Clipboard Flow', () => {

  test('Universal Converter COPY OUTPUT copies result and TaskBoard/TasksApp PASTE inputs answer', async ({ page }) => {
    test.setTimeout(45000);
    const testSquad = `CopySquad_${Date.now().toString().slice(-4)}`;

    await page.addInitScript(({ squad }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '505');
      sessionStorage.setItem('cyphora_team_name', squad);
      sessionStorage.setItem('cyphora_team_id', '505');
      sessionStorage.setItem('cyphora_active_round', '1');
    }, { squad: testSquad });

    await page.goto('/');

    // Ensure session or begin if needed
    const startBtn = page.locator('button:has-text("BEGIN INVESTIGATION"), button:has-text("START EXPEDITION")');
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }

    // Task 1 modal is open. Minimize it so desktop is fully clear
    const minBtn = page.locator('button[title*="Minimize task"], button[title*="Close task"]').first();
    if (await minBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await minBtn.click();
    }

    // Open Universal Converter via desktop icon double-click or app launcher
    const converterIcon = page.locator('.desktop-icon[data-app-id="converter"]');
    await expect(converterIcon).toBeVisible({ timeout: 5000 });
    await converterIcon.dblclick();

    // Verify Universal Converter window is visible
    const converterApp = page.locator('.universal-converter-app');
    await expect(converterApp).toBeVisible({ timeout: 8000 });

    // Choose format: Decimal -> Text
    // Click Decimal pill under FROM
    const decimalFromPill = converterApp.locator('.from-pills button:has-text("Decimal (0–9 Format)")');
    await decimalFromPill.click();

    // Click Text pill under TO
    const textToPill = converterApp.locator('.to-pills button:has-text("Text")');
    await textToPill.click();

    // Fill input textarea with Task 1 numbers (72 73 68 69 = HIDE)
    const inputTextarea = converterApp.locator('textarea.converter-textarea').first();
    await inputTextarea.fill('72 73 68 69');

    // Verify auto-conversion converted it to 'HIDE' in output box
    const outputTextarea = converterApp.locator('textarea.output-box');
    await expect(outputTextarea).toHaveValue('HIDE', { timeout: 3000 });

    // Click the COPY OUTPUT button
    const copyOutputBtn = converterApp.locator('button:has-text("COPY OUTPUT")');
    await expect(copyOutputBtn).toBeEnabled();
    await copyOutputBtn.click();

    // Verify button shows visual feedback 'Copied!'
    await expect(converterApp.locator('button:has-text("Copied!")').first()).toBeVisible({ timeout: 3000 });

    // Verify value was stored in sessionStorage cyphora_last_copied_value
    const copiedVal = await page.evaluate(() => sessionStorage.getItem('cyphora_last_copied_value'));
    expect(copiedVal).toBe('HIDE');

    // Restore TaskBoard from dock or bottom pill
    const taskDockBtn = page.locator('button:has-text("TASK 01"), .dock-icon[title*="Task"]').first();
    if (await taskDockBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await taskDockBtn.click();
    }

    // Check TaskBoard input & PASTE button
    const taskDialog = page.locator('.task-objective-overlay, dialog[aria-label*="TASK 01"], .tasks-app-container').first();
    const pasteBtn = page.locator('button:has-text("PASTE")').first();
    await expect(pasteBtn).toBeVisible({ timeout: 5000 });
    await pasteBtn.click();

    // Verify input was populated with 'HIDE'
    const answerInput = page.locator('.objective-answer-field, .tasks-input').first();
    await expect(answerInput).toHaveValue('HIDE');

    // Submit answer
    const submitBtn = page.locator('button:has-text("SUBMIT ANSWER"), .tasks-submit-btn').first();
    await submitBtn.click();

    // Verify Task 1 succeeded and Task 02 is now active
    await expect(page.locator('text=TASK 02').first()).toBeVisible({ timeout: 5000 });
  });

});
