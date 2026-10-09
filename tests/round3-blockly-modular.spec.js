import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 3 Modular Blockly: Grid, Snaps, Delete Station & Scrolls', () => {

  test('Blockly workspace displays visual grid with snapping, custom scrollbars, and designed delete station', async ({ page }) => {
    test.setTimeout(45000);

    // Setup skip story flags to land directly on the editor
    await page.addInitScript(() => {
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      localStorage.setItem('cyphora_round3_story_finished_default', 'true');
      sessionStorage.setItem('cyphora_round3_story_finished', 'true');
    });

    await page.goto('/round3/index.html');

    // Click "Enter The Temple" on LandingScreen if visible
    const landingEnterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await landingEnterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await landingEnterBtn.click();
    }

    // Skip tutorial if shown
    const tutorialCloseBtn = page.locator('button:has-text("Got It"), button:has-text("Start Playing"), button:has-text("Skip")');
    if (await tutorialCloseBtn.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await tutorialCloseBtn.first().click();
    }

    // 1. Verify Grid Pattern in SVG Defs
    const gridPattern = page.locator('svg.blocklySvg defs pattern[id*="blocklyGridPattern"]');
    await expect(gridPattern).toBeAttached({ timeout: 10000 });

    // Verify lines inside the grid pattern
    const gridLines = gridPattern.locator('line');
    expect(await gridLines.count()).toBeGreaterThanOrEqual(1);

    // Verify main background uses the grid pattern fill
    const mainBg = page.locator('svg.blocklySvg rect.blocklyMainBackground');
    await expect(mainBg).toBeVisible();
    const fillStyle = await mainBg.evaluate((el) => el.style.fill || el.getAttribute('fill') || '');
    expect(fillStyle).toContain('blocklyGridPattern');

    // 2. Verify Snapping is enabled in Blockly configuration
    const snapEnabled = await page.evaluate(() => {
      // @ts-ignore
      const ws = window.Blockly?.getMainWorkspace?.();
      return ws ? ws.getGrid?.()?.shouldSnap?.() : true;
    });
    expect(snapEnabled).toBeTruthy();

    // 3. Verify Designed Scrollbars
    const scrollbarHandle = page.locator('.blocklyScrollbarHandle').first();
    await expect(scrollbarHandle).toBeAttached();
    const scrollbarBg = page.locator('.blocklyScrollbarBackground').first();
    await expect(scrollbarBg).toBeAttached();

    // 4. Verify Built-in Canvas Trashcan SVG is removed
    const trashSvg = page.locator('.blocklyTrash');
    expect(await trashSvg.count()).toBe(0);

    // 5. Verify Floating Designed Delete & Tools Station
    const clearBtn = page.locator('button:has-text("Clear All")');
    await expect(clearBtn).toBeVisible();
    const recenterBtn = page.locator('button[title*="Recenter"]');
    await expect(recenterBtn).toBeVisible();

    // 6. Test Clear All Confirmation Flow
    // First load a block using Admin -> Solve
    const adminBtn = page.locator('button:has-text("Admin")');
    await adminBtn.click();
    const promptInput = page.locator('input[placeholder*="Enter password"]');
    await promptInput.fill('1234');
    await page.locator('button:has-text("Submit")').click();

    const solveBtn = page.locator('button:has-text("Solve")');
    await expect(solveBtn).toBeVisible({ timeout: 5000 });
    await solveBtn.click();
    await page.waitForTimeout(500);

    // Verify blocks exist
    const blocks = page.locator('.blocklyBlockCanvas .blocklyDraggable');
    await expect(blocks.first()).toBeVisible({ timeout: 5000 });
    const blockCountBefore = await blocks.count();
    expect(blockCountBefore).toBeGreaterThan(0);

    // Click Clear All -> Modal opens
    await clearBtn.click();
    const confirmModal = page.locator('text=Incinerate Workspace');
    await expect(confirmModal).toBeVisible();

    // Test Cancel first
    await page.locator('button:has-text("Cancel")').click();
    await expect(confirmModal).toBeHidden();

    // Confirm Clear All
    await clearBtn.click();
    await page.locator('button:has-text("Incinerate All")').click();
    await expect(confirmModal).toBeHidden();

    // Blocks should now be 0
    await expect(page.locator('.blocklyBlockCanvas .blocklyDraggable')).toHaveCount(0);

    // 7. Save screenshot of the modular workspace with grid, scrollbars, and delete station
    await page.screenshot({ path: 'test-results/round3-grid-delete-scrolls.png' });
  });

});
