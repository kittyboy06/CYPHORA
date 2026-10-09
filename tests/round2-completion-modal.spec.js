import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('CYPHORA Round 2 Modals and Round 3 Transition Flow', () => {

  test('Image 1 score modal appears, Image 2 score modal appears, and transitions to Round 3', async ({ page }) => {
    test.setTimeout(90000);
    const squad = `R2ModalSquad_${Date.now().toString().slice(-6)}`;

    page.on('console', msg => console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[PAGE ERROR]: ${err.message}`));
    page.on('requestfailed', req => console.log(`[REQ FAILED]: ${req.method()} ${req.url()} - ${req.failure()?.errorText}`));
    page.on('response', res => {
      if (res.url().includes('/api/stage2/')) {
        console.log(`[API RESPONSE]: ${res.status()} ${res.url()}`);
      }
    });

    // 1. Register team via backend
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '2233',
        member1: 'Alex',
        member2: 'Blake'
      }
    });
    expect(regRes.ok()).toBeTruthy();
    const regData = await regRes.json();
    const teamId = regData.team?.id || regData.team_id;

    // 2. Setup session/local storage
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
    }, { token: regData.token, teamId, teamName: squad });

    // 3. Open OS Desktop
    await page.goto('/');

    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    await expect(page.locator('.os-taskbar')).toBeVisible({ timeout: 15000 });

    // Open Start menu and launch Round 2
    await page.locator('.taskbar-start-btn').click();
    const startMenu = page.locator('.os-start-menu');
    await expect(startMenu).toBeVisible();
    await startMenu.locator('.start-app-item', { hasText: /Round 2|Image Navigation/i }).click();

    // Sector 4 Briefing -> click "Launch Round 2"
    const launchR2Btn = page.locator('button:has-text("Launch Round 2")');
    await expect(launchR2Btn).toBeVisible({ timeout: 15000 });
    await launchR2Btn.click();

    // Round 2 Workspace should now be active
    const r2Body = page.locator('.os-round2-body');
    await expect(r2Body).toBeVisible({ timeout: 15000 });

    // Prepare test image
    const testImage1Path = path.resolve('public/assets/round2/targets/target1.jpg');
    const testImage2Path = path.resolve('public/assets/round2/targets/target2.jpg');

    // --- PHASE 1: Image 1 Upload & Evaluation ---
    const promptInput = page.locator('.os-round2-prompt-card textarea');
    await promptInput.fill('Ancient moss-covered Mayan temple ruins submerged in golden sunlight');

    // Attach Image 1
    const fileInput1 = page.locator('input[type="file"]').first();
    await fileInput1.setInputFiles(testImage1Path);
    await page.waitForTimeout(500);

    // Click "Evaluate Image 1"
    const submitBtn = page.locator('button.os-submit-btn');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // --- VERIFY: First Fragment Score Modal Pops Up ---
    const firstModal = page.locator('.temple-modal-backdrop');
    await expect(firstModal).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#first-fragment-modal-title')).toBeVisible();
    await expect(page.locator('.temple-modal-score-stone')).toBeVisible();
    await expect(page.locator('.temple-score-value').first()).toBeVisible();

    // Click "Proceed to Final Fragment"
    const proceedFirstBtn = page.locator('#first-fragment-proceed-btn');
    await expect(proceedFirstBtn).toBeVisible();
    await proceedFirstBtn.click();

    // First modal should be dismissed
    await expect(firstModal).toBeHidden();

    // Phase Indicator should now show Phase 2
    await expect(page.locator('.os-round2-phase-pill')).toContainText(/Phase 2|Target 2/i);

    // --- PHASE 2: Image 2 Upload & Evaluation ---
    await promptInput.fill('Ancient obsidian temple gateway unsealed with luminescent jungle glyphs');

    // Attach Image 2
    const fileInput2 = page.locator('input[type="file"]').first();
    await fileInput2.setInputFiles(testImage2Path);
    await page.waitForTimeout(500);

    // Click "Finalize Image 2"
    await submitBtn.click();

    // --- VERIFY: Final Fragment Score Modal Pops Up ---
    const finalModal = page.locator('.temple-modal-backdrop');
    await expect(finalModal).toBeVisible({ timeout: 30000 });
    await expect(page.locator('#final-fragment-modal-title')).toBeVisible();
    await expect(page.locator('.temple-modal-score-row')).toBeVisible();

    // Verify "Proceed to Round 3" button is present in the modal
    const proceedRound3Btn = page.locator('#final-fragment-proceed-btn');
    await expect(proceedRound3Btn).toBeVisible();
    await expect(proceedRound3Btn).toContainText(/Round 3/i);

    // Click "Enter Temple: Proceed to Round 3"
    await proceedRound3Btn.click();

    // Final modal should close and Round 3 window/game should appear
    await expect(finalModal).toBeHidden();

    // Wait for Round 3 App or Kiosk view to load inside OS
    const round3Element = page.locator('.round3-kiosk-view, .round3-kiosk-frame, iframe[src*="round3"]').first();
    await expect(round3Element).toBeVisible({ timeout: 15000 });
  });

});
