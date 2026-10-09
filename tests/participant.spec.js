import { test, expect } from '@playwright/test';

test.describe('CYPHORA Participant Workstation', () => {

  test('01. Landing Page - Canvas interaction & Registration / Resume Modal validation', async ({ page }) => {
    await page.goto('/');

    // 1. Initial Screen with ParticleTextEffect
    await expect(page.locator('canvas.particle-canvas')).toBeVisible();

    // Click START button once it fades in
    const startBtn = page.locator('button.start-journey-btn');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    // Expedition Access modal should appear
    const modal = page.locator('.team-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Expedition Access' })).toBeVisible();

    // 2. PIN Masking Toggle (Eye button)
    const pinInput = modal.locator('input#reg_team_pin');
    await pinInput.fill('9876');
    await expect(pinInput).toHaveClass(/pin-mask-input/);

    const eyeBtn = modal.locator('.pin-toggle-btn');
    await eyeBtn.click();
    await expect(pinInput).not.toHaveClass(/pin-mask-input/);
    await eyeBtn.click();
    await expect(pinInput).toHaveClass(/pin-mask-input/);

    // 3. Switch between Register and Returning Squad (Resume)
    const switchBtn = modal.locator('.returning-player-toggle-btn');
    await switchBtn.click();

    // Mode should now be Resume
    await expect(modal.getByRole('heading', { name: 'Resume Expedition' })).toBeVisible();
    await expect(modal.locator('input#resume_team_name')).toBeVisible();
    await expect(modal.locator('input#resume_team_pin')).toBeVisible();

    // Attempting resume with dummy non-existent credentials
    await modal.locator('input#resume_team_name').fill('GhostSquad_NonExistent');
    await modal.locator('input#resume_team_pin').fill('0000');
    await modal.locator('button.resume-submit-btn').click();

    // Error banner should appear
    await expect(modal.locator('.auth-error-alert')).toBeVisible();

    // Switch back to Register
    const backToRegBtn = modal.locator('.returning-player-toggle-btn.back-btn');
    await backToRegBtn.click();
    await expect(modal.getByRole('heading', { name: 'Expedition Access' })).toBeVisible();

    // Close modal
    await modal.locator('.team-modal-close').click();
    await expect(modal).not.toBeVisible();
  });

  test('02. Team Registration & Prologue Narrative Experience', async ({ page }) => {
    await page.goto('/');
    const startBtn = page.locator('button.start-journey-btn');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    const modal = page.locator('.team-modal');
    await expect(modal).toBeVisible();

    const uniqueSquadName = `Vanguard_${Date.now().toString().slice(-6)}`;
    await modal.locator('input#reg_team_name').fill(uniqueSquadName);
    await modal.locator('input#reg_team_pin').fill('4321');
    await modal.locator('input#reg_member_1').fill('Kaelen');
    await modal.locator('input#reg_member_2').fill('Lyra');

    // Submit registration
    await modal.locator('.modal-submit-btn').click();

    // Expect transition to Prologue
    await expect(page.locator('.prologue-shell')).toBeVisible();
    await expect(page.getByText('THE AWAKENING')).toBeVisible();
    await expect(page.getByText(uniqueSquadName)).toBeVisible();

    // Test scene progression via progress dots
    const dots = page.locator('.progress-dots button.dot');
    await expect(dots).toHaveCount(6);

    // Jump directly to the final decision scene (Scene 6)
    await dots.nth(5).click();
    await expect(page.getByText('THE DECISION')).toBeVisible();

    // Begin Expedition button is now visible
    const beginBtn = page.getByRole('button', { name: /BEGIN EXPEDITION/i });
    await expect(beginBtn).toBeVisible();
    await beginBtn.click();

    // Boot overlay appears briefly
    await expect(page.locator('.prologue-boot-overlay')).toBeVisible();

    // Clicking Boot screen or letting it finish launches right into OS workstation
    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    // Then transitions into Virtual OS Desktop Environment!
    await expect(page.locator('.os-desktop-root')).toBeVisible({ timeout: 20000 });
  });

  test('03. Participant Hub - Explorers Drawer & Level Cards & Exit Station', async ({ page }) => {
    const testSquad = `ExplorerHub_${Date.now().toString().slice(-6)}`;

    // Fast register via API and setup storage
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: testSquad,
        pin: '1122',
        member1: 'Pilot Alpha',
        member2: 'CoPilot Beta'
      }
    });
    const regData = await regRes.json();

    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'main');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
    }, { token: regData.token, teamId: regData.team_id, teamName: testSquad });

    // Navigate to / (without stage URL parameter so exit transitions cleanly)
    await page.goto('/');

    // 1. Verify Header info
    await expect(page.locator('.main-ui')).toBeVisible();
    await expect(page.locator('.header-panel')).toBeVisible();
    await expect(page.locator('.header-panel')).toContainText(testSquad);

    // 2. Test Explorers Side Panel
    const explorersBtn = page.locator('button.explorers-btn');
    await expect(explorersBtn).toBeVisible();
    await explorersBtn.click();

    const drawer = page.locator('.explorer-panel');
    await expect(drawer).toHaveClass(/open/);
    await expect(drawer.getByText(/Other Explorers/i)).toBeVisible();

    // Close panel using close button
    await drawer.locator('.panel-close').click();
    await expect(drawer).not.toHaveClass(/open/);

    // 3. Verify Level Cards
    const osCard = page.locator('.level-card', { hasText: 'OS Navigation' });
    const r2Card = page.locator('.level-card', { hasText: 'Image Navigation' });
    const r3Card = page.locator('.level-card', { hasText: 'The Temple Trials' });

    await expect(osCard).toBeVisible();
    await expect(osCard).toHaveClass(/unlocked/);

    await expect(r2Card).toBeVisible();
    await expect(r3Card).toBeVisible();

    // 4. Test Station Exit
    page.once('dialog', dialog => dialog.accept());
    const exitStationBtn = page.locator('button.hub-signout-btn');
    await expect(exitStationBtn).toBeVisible();
    await exitStationBtn.click();

    // Should return to Initial Landing Screen with Canvas
    await expect(page.locator('canvas.particle-canvas')).toBeVisible();
  });

  test('04. Session Recovery - Resume Expedition with PIN', async ({ page }) => {
    const resumeSquad = `ResumeSquad_${Date.now().toString().slice(-6)}`;
    await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: resumeSquad,
        pin: '7788',
        member1: 'Specialist A',
        member2: 'Specialist B'
      }
    });

    await page.goto('/');
    const startBtn = page.locator('button.start-journey-btn');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    const modal = page.locator('.team-modal');
    await expect(modal).toBeVisible();

    // Switch to Resume mode
    await modal.locator('.returning-player-toggle-btn').click();
    await expect(modal.getByRole('heading', { name: 'Resume Expedition' })).toBeVisible();

    // Fill registered credentials
    await modal.locator('input#resume_team_name').fill(resumeSquad);
    await modal.locator('input#resume_team_pin').fill('7788');
    await modal.locator('button.resume-submit-btn').click();

    // Should successfully restore session into Hub, OS, or Prologue
    await expect(page.locator('.main-ui, .prologue-shell, .os-desktop-root')).toBeVisible({ timeout: 15000 });
  });

  test('05. OS Boot Sequence & Desktop Environment Launch', async ({ page }) => {
    const osSquad = `OSExplorer_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: osSquad,
        pin: '3344',
        member1: 'CyberAgent',
        member2: 'FieldAgent'
      }
    });
    const regData = await regRes.json();

    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'main');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
    }, { token: regData.token, teamId: regData.team_id, teamName: osSquad });

    await page.goto('/');

    // Click Enter OS on Stage 1 card
    const enterOsBtn = page.locator('.level-card', { hasText: 'OS Navigation' }).locator('.enter-os-btn');
    await enterOsBtn.click();

    // Boot screen should appear
    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    // Now Desktop Environment should be loaded!
    await expect(page.locator('.os-desktop-root')).toBeVisible({ timeout: 15000 });

    // Verify HUD & Taskbar
    await expect(page.locator('.os-taskbar')).toBeVisible();
    await expect(page.locator('.taskbar-start-btn')).toBeVisible();
    await expect(page.locator('.desktop-top-right-hud')).toBeVisible();
  });

  test('06. OS Applications Launch & Window Manager Controls', async ({ page }) => {
    const squad = `AppTester_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '5566',
        member1: 'Operator1',
        member2: 'Operator2'
      }
    });
    const regData = await regRes.json();

    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
    }, { token: regData.token, teamId: regData.team_id, teamName: squad });

    // Directly open OS desktop
    await page.goto('/');

    // Skip boot screen if present
    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    await expect(page.locator('.os-taskbar')).toBeVisible({ timeout: 15000 });

    const taskModal = page.locator('.objective-modal');
    if (await taskModal.isVisible()) {
      await page.keyboard.press('Escape');
    }

    // 1. Open and test Terminal from Start Menu
    await page.locator('.taskbar-start-btn').click();
    const startMenu = page.locator('.os-start-menu');
    await expect(startMenu).toBeVisible();

    // Launch Terminal
    await startMenu.locator('.start-app-item', { hasText: 'Terminal Interpreter' }).click();

    // Verify Terminal window opened
    const termWindow = page.locator('.window-frame', { hasText: 'Terminal Interpreter' });
    await expect(termWindow).toBeVisible();

    // Run command in Terminal
    const termInput = termWindow.locator('input.terminal-input-element');
    await expect(termInput).toBeVisible();
    await termInput.fill('help');
    await termInput.press('Enter');
    await page.waitForTimeout(400);

    await termInput.fill('ls');
    await termInput.press('Enter');
    await page.waitForTimeout(400);

    // Minimize Terminal
    await termWindow.locator('.win-ctrl-minimize').click();
    await expect(termWindow).not.toBeVisible();

    // Restore Terminal from Taskbar
    await page.locator('.os-taskbar button', { hasText: 'Terminal' }).click();
    await expect(termWindow).toBeVisible();

    // Close Terminal
    await termWindow.locator('.win-ctrl-close').click();
    await expect(termWindow).not.toBeVisible();

    // 2. Open Universal Converter from Desktop Icon (double click)
    const convIcon = page.locator('.desktop-icon-cell', { hasText: 'Universal Converter' });
    if (await convIcon.isVisible()) {
      await convIcon.dblclick();

      const convWindow = page.locator('.window-frame', { hasText: 'Universal Converter' });
      await expect(convWindow).toBeVisible();

      // Click Decimal format in FROM section (use exact regex so it does not match Hexadecimal)
      const decPill = convWindow.locator('.from-pills button', { hasText: /^Decimal/i });
      if (await decPill.isVisible()) {
        await decPill.click();
      }

      // Fill textarea
      const convTextarea = convWindow.locator('textarea.converter-textarea').first();
      await convTextarea.fill('72 73 68 69');

      // Click Convert Data button
      await convWindow.locator('button.convert-action-btn').click();
      await page.waitForTimeout(400);

      // Verify output contains HIDE
      const outputArea = convWindow.locator('textarea.output-box');
      await expect(outputArea).toHaveValue(/HIDE/i);

      // Close Converter
      await convWindow.locator('.win-ctrl-close').click();
    }

    // 3. Open Metadata Inspector
    const metaIcon = page.locator('.desktop-icon-cell', { hasText: 'Metadata Inspector' });
    if (await metaIcon.isVisible()) {
      await metaIcon.dblclick();
      const metaWindow = page.locator('.window-frame', { hasText: 'Metadata Inspector' });
      await expect(metaWindow).toBeVisible();
      await metaWindow.locator('.win-ctrl-close').click();
    }

    // 4. Open Settings App
    const settingsIcon = page.locator('.desktop-icon-cell', { hasText: 'Settings' });
    if (await settingsIcon.isVisible()) {
      await settingsIcon.dblclick();
      const settingsWindow = page.locator('.window-frame', { hasText: 'Settings' });
      await expect(settingsWindow).toBeVisible();
      await settingsWindow.locator('.win-ctrl-close').click();
    }
  });

  test('07. Task Board - Solving Investigation Task 1 (Encoded Message -> HIDE)', async ({ page }) => {
    const solverSquad = `Solver_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: solverSquad,
        pin: '1234',
        member1: 'Solv1',
        member2: 'Solv2'
      }
    });
    const regData = await regRes.json();

    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
    }, { token: regData.token, teamId: regData.team_id, teamName: solverSquad });

    await page.goto('/');

    // Skip boot screen if present
    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    await expect(page.locator('.os-taskbar')).toBeVisible({ timeout: 15000 });

    // Task Board modal is automatically open or open from bottom-right tab
    const taskModal = page.locator('.objective-modal');
    const taskTab = page.locator('button.objective-tab');
    if (await taskTab.isVisible()) {
      await taskTab.click();
    }
    await expect(taskModal).toBeVisible();
    await expect(taskModal.locator('h2#objective-title')).toContainText('ENCODED MESSAGE');

    // 1. Submit incorrect answer first
    const answerInput = taskModal.locator('.objective-answer-form input[type="text"]');
    await answerInput.fill('WRONG_ANSWER');
    await taskModal.locator('.objective-answer-form button[type="submit"]').click();
    await page.waitForTimeout(500);

    // Expect error feedback
    await expect(taskModal.getByText(/Not quite/i)).toBeVisible();

    // 2. Request Hint
    const hintBtn = taskModal.locator('button.objective-secondary-button');
    if (await hintBtn.isVisible()) {
      await hintBtn.click();
      await page.waitForTimeout(400);
      await expect(taskModal.locator('.objective-hint')).toBeVisible();
    }

    // 3. Submit Correct Answer: HIDE
    await answerInput.fill('HIDE');
    await taskModal.locator('.objective-answer-form button[type="submit"]').click();

    // Verifies answer was accepted and Task 2 automatically unlocked!
    await expect(taskModal.locator('h2#objective-title')).toContainText('FILE INFORMATION', { timeout: 15000 });
  });

  test('08. Return to Hub from OS Desktop & Score Sync', async ({ page }) => {
    const returnSquad = `ReturnSquad_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: returnSquad,
        pin: '9090',
        member1: 'RetAgent1',
        member2: 'RetAgent2'
      }
    });
    const regData = await regRes.json();

    await page.addInitScript(({ token, teamId, teamName }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_name', teamName);
    }, { token: regData.token, teamId: regData.team_id, teamName: returnSquad });

    await page.goto('/');

    // Skip boot screen if present
    const bootContainer = page.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    await expect(page.locator('.os-taskbar')).toBeVisible({ timeout: 15000 });

    const taskModal = page.locator('.objective-modal');
    if (await taskModal.isVisible()) {
      await page.keyboard.press('Escape');
    }

    // Open Start Menu -> Exit Station / Return to Hub
    await page.locator('.taskbar-start-btn').click();
    const startMenu = page.locator('.os-start-menu');
    await expect(startMenu).toBeVisible();

    page.once('dialog', dialog => dialog.accept());
    await startMenu.locator('.start-logout-btn').click();

    // Workstation transitions cleanly back to Initial Landing Canvas
    await expect(page.locator('canvas.particle-canvas')).toBeVisible({ timeout: 15000 });
  });

});
