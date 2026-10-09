import { test, expect } from '@playwright/test';

test.describe('CYPHORA Cross-Portal Real-Time Synchronization', () => {

  test('Real-time Team Registration, Score Delta, Round 2 Clearance & Credential Rotation', async ({ browser }) => {
    // 1. Create two isolated browser contexts: Admin and Participant
    const adminContext = await browser.newContext();
    const participantContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const participantPage = await participantContext.newPage();

    const e2eSquad = `E2ESync_${Date.now().toString().slice(-6)}`;
    const initialPin = '3322';
    const updatedPin = '9988';

    // ── Phase 1: Admin logs into Control Portal ──
    await adminPage.goto('/admin');
    await adminPage.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await adminPage.locator('.admin-login-btn').click();
    await expect(adminPage.locator('.admin-navbar')).toBeVisible({ timeout: 15000 });

    // ── Phase 2: Participant registers on workstation ──
    await participantPage.goto('/');
    const startBtn = participantPage.locator('button.start-journey-btn');
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    const regModal = participantPage.locator('.team-modal');
    await expect(regModal).toBeVisible();
    await regModal.locator('input#reg_team_name').fill(e2eSquad);
    await regModal.locator('input#reg_team_pin').fill(initialPin);
    await regModal.locator('input#reg_member_1').fill('SyncLead');
    await regModal.locator('input#reg_member_2').fill('SyncWingman');
    await regModal.locator('.modal-submit-btn').click();

    // Skip prologue narrative quickly to Hub
    await expect(participantPage.locator('.prologue-shell')).toBeVisible({ timeout: 15000 });
    const dots = participantPage.locator('.progress-dots button.dot');
    await expect(dots).toHaveCount(6);
    await dots.nth(5).click();

    const beginBtn = participantPage.getByRole('button', { name: /BEGIN EXPEDITION/i });
    await expect(beginBtn).toBeVisible();
    await beginBtn.click();

    // Dismiss boot screen if present
    const bootContainer = participantPage.locator('.bootscreen-container');
    if (await bootContainer.isVisible()) {
      await bootContainer.click();
    }

    // ── Phase 3: Verify Admin receives newly registered squad live via WebSocket ──
    // Search for our created team in Admin
    const searchInput = adminPage.locator('.admin-search-input input');
    await searchInput.fill(e2eSquad);
    await adminPage.waitForTimeout(600);

    const teamRow = adminPage.locator('tr', { hasText: e2eSquad });
    await expect(teamRow).toBeVisible({ timeout: 15000 });

    // ── Phase 4: Admin awards +20 Quick Score to Squad ──
    const plus20Btn = teamRow.locator('button', { hasText: '+20' });
    await expect(plus20Btn).toBeVisible();
    await plus20Btn.click();
    await adminPage.waitForTimeout(700);

    // ── Phase 5: Admin grants Round 2 Access to Squad ──
    const r2ToggleBtn = teamRow.locator('button[title*="Round 2" i]');
    await expect(r2ToggleBtn.first()).toBeVisible();
    await r2ToggleBtn.first().click();
    await adminPage.waitForTimeout(700);

    // ── Phase 6: Admin updates Team Secret PIN via Modal ──
    const pinBtn = teamRow.locator('button[title*="Reset / Update Team PIN" i]');
    await expect(pinBtn.first()).toBeVisible();
    await pinBtn.first().click();

    const pinModal = adminPage.locator('.admin-modal', { hasText: /Team Secret PIN/i });
    await expect(pinModal).toBeVisible();

    const newPinInput = pinModal.locator('input[placeholder*="PIN"]');
    await newPinInput.fill(updatedPin);
    await pinModal.getByRole('button', { name: /Save New PIN/i }).click();
    await adminPage.waitForTimeout(700);
    await expect(pinModal).not.toBeVisible();

    // ── Phase 7: Participant re-authenticates with new PIN on Workstation ──
    // Clear previous session from storage to simulate a fresh workstation login
    await participantPage.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await participantPage.goto('/');

    const resumeStartBtn = participantPage.locator('button.start-journey-btn');
    await expect(resumeStartBtn).toBeVisible({ timeout: 10000 });
    await resumeStartBtn.click();

    const authModal = participantPage.locator('.team-modal');
    await expect(authModal).toBeVisible();

    // Switch to Resume Expedition
    await authModal.locator('.returning-player-toggle-btn').click();
    await expect(authModal.getByRole('heading', { name: 'Resume Expedition' })).toBeVisible();

    // 1. Try resuming with OLD PIN (should fail)
    await authModal.locator('input#resume_team_name').fill(e2eSquad);
    await authModal.locator('input#resume_team_pin').fill(initialPin);
    await authModal.locator('button.resume-submit-btn').click();

    await expect(authModal.locator('.auth-error-alert')).toBeVisible({ timeout: 10000 });

    // 2. Resume with NEW PIN updated by Admin (should succeed!)
    await authModal.locator('input#resume_team_pin').fill(updatedPin);
    await authModal.locator('button.resume-submit-btn').click();

    // Session successfully recovered into Hub or OS!
    await expect(participantPage.locator('.main-ui, .os-desktop-root')).toBeVisible({ timeout: 15000 });

    // Clean up contexts
    await adminContext.close();
    await participantContext.close();
  });

});
