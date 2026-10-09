import { test, expect } from '@playwright/test';

test.describe('CYPHORA Deep Rounds Verification (Round 2 & Round 3)', () => {

  test('01. Round 2 - Permission Gate, Master Clearance & Image Navigation Workspace', async ({ page }) => {
    const squad = `R2Squad_${Date.now().toString().slice(-6)}`;

    // 1. Register team via backend
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '2233',
        member1: 'NavAlpha',
        member2: 'NavBeta'
      }
    });
    const regData = await regRes.json();

    // Setup session storage with Round 2 clearance
    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      sessionStorage.setItem('cyphora_round2_unlocked', 'true');
      sessionStorage.setItem('cyphora_round2_supervisor_override', 'true');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
      localStorage.setItem('cyphora_round2_unlocked', 'true');
      localStorage.setItem('cyphora_round2_supervisor_override', 'true');
    }, { token: regData.token, teamId: regData.team_id, teamName: squad });

    // Open OS Desktop
    await page.goto('/');

    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    await expect(page.locator('.os-taskbar')).toBeVisible({ timeout: 15000 });

    // Launch Round 2 via Desktop Icon (double click)
    const r2Icon = page.locator('.desktop-icon-cell', { hasText: 'Round 2' });
    if (await r2Icon.isVisible()) {
      await r2Icon.dblclick();
    } else {
      await page.locator('.taskbar-start-btn').click();
      const startMenu = page.locator('.os-start-menu');
      await expect(startMenu).toBeVisible();
      await startMenu.locator('.start-app-item', { hasText: /Round 2|Image Navigation/i }).click();
    }

    // 2. Sector 4 Briefing window appears -> click "Launch Round 2"
    const launchR2Btn = page.locator('button:has-text("Launch Round 2")');
    await expect(launchR2Btn).toBeVisible({ timeout: 15000 });
    await launchR2Btn.click();

    // 3. Round 2 Workspace should now be active
    const r2Body = page.locator('.os-round2-body');
    await expect(r2Body).toBeVisible({ timeout: 15000 });

    // Phase Indicator check (Phase 1: Target 1)
    await expect(page.locator('.os-round2-phase-pill')).toBeVisible();

    // Reference Target card
    await expect(page.locator('.os-round2-target-card')).toBeVisible();

    // 4. Prompt Studio Validation
    const promptInput = page.locator('.os-round2-prompt-card textarea');
    await expect(promptInput).toBeVisible();

    // Attempt submitting empty / short prompt
    const submitBtn = page.locator('button.os-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Form validation error should appear
    await expect(page.locator('.os-alert-banner.error')).toBeVisible();

    // Fill valid detailed prompt (>= 10 chars)
    await promptInput.fill('Ancient Mayan temple with glowing emerald moss and twilight skies');
    await page.waitForTimeout(300);

    // Save prompt to VFS or copy
    const savePromptBtn = page.locator('button[title*="Save Prompt" i]');
    if (await savePromptBtn.isVisible()) {
      await savePromptBtn.click();
      await page.waitForTimeout(400);
      await expect(page.locator('.os-alert-banner.success')).toBeVisible();
    }

    // Reconstruction Upload area
    await expect(page.locator('.os-round2-upload-card')).toBeVisible();
  });

  test('02. Round 3 - The Jungle Code (Phaser Canvas, Blockly Workspace & Admin Solve)', async ({ page }) => {
    // 1. Direct navigation to Round 3 game
    await page.addInitScript(() => {
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      sessionStorage.setItem('cyphora_round3_story_finished', 'true');
    });

    await page.goto('/round3/index.html');

    // 2. Landing Screen
    const landingEnterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await landingEnterBtn.isVisible()) {
      await expect(page.getByText(/CYPHORA/i)).toBeVisible();
      await expect(page.getByText(/The Temple Trials/i)).toBeVisible();
      await landingEnterBtn.click();
    }

    // 3. Skip tutorial if visible
    const tutorialCloseBtn = page.locator('button:has-text("Got It"), button:has-text("Start Playing"), button:has-text("Skip")');
    if (await tutorialCloseBtn.isVisible()) {
      await tutorialCloseBtn.first().click();
    }

    // 4. Verify Game Interface Components
    // Task banner and optimal targets
    await expect(page.locator('h3:has-text("Current Task")')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Optimal Target/i)).toBeVisible();

    // Phaser canvas element
    const gameCanvas = page.locator('canvas');
    await expect(gameCanvas).toBeVisible({ timeout: 15000 });

    // Blockly toolbox tree items (Actions, Logic, Loops, Math, Variables, Functions)
    await expect(page.getByRole('treeitem', { name: 'Actions' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('treeitem', { name: 'Logic' })).toBeVisible();
    await expect(page.getByRole('treeitem', { name: 'Loops' })).toBeVisible();

    // Run and Reset buttons
    const runBtn = page.locator('button:has-text("Run")');
    await expect(runBtn).toBeVisible();

    // 5. Admin Cheat / Level Unlock Modal
    const adminLockBtn = page.locator('button:has-text("Admin")');
    await expect(adminLockBtn).toBeVisible();
    await adminLockBtn.click();

    // Enter password in modal prompt
    const promptInput = page.locator('input[placeholder*="Enter password"]');
    await expect(promptInput).toBeVisible({ timeout: 5000 });
    await promptInput.fill('1234');
    await page.locator('button:has-text("Submit")').click();
    await page.waitForTimeout(500);

    // Verify Solve button is now revealed
    const solveBtn = page.locator('button:has-text("Solve")');
    await expect(solveBtn).toBeVisible({ timeout: 5000 });

    // Click Solve to auto-load solution into Blockly
    await solveBtn.click();
    await page.waitForTimeout(600);

    // Level selector dropdown is now active
    const levelSelect = page.locator('select');
    await expect(levelSelect).toBeVisible();
    await expect(levelSelect).toHaveValue('1');

    // 6. Test Reset Button
    const resetIconBtn = page.locator('button:has(svg.lucide-rotate-ccw)');
    if (await resetIconBtn.isVisible()) {
      await resetIconBtn.first().click();
      await page.waitForTimeout(300);
    }
  });

});
