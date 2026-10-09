import { test, expect } from '@playwright/test';

test.describe('CYPHORA Admin Extended Operations Suite', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();
    await expect(page.locator('.admin-navbar')).toBeVisible();
  });

  test('01. Team Deletion Lifecycle - Confirmation dismissal preserves team, approval deletes team', async ({ page }) => {
    // 1. Create a dedicated team to delete
    const victimTeam = `DelSquad_${Date.now().toString().slice(-6)}`;
    await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: victimTeam,
        pin: '1122',
        member1: 'Target1',
        member2: 'Target2'
      }
    });

    // Refresh teams list in admin
    await page.locator('.admin-navbar button', { hasText: 'Sync' }).click();
    await page.waitForTimeout(500);

    // Search for the victim team
    const searchInput = page.locator('.admin-search-input input');
    await searchInput.fill(victimTeam);
    await page.waitForTimeout(500);

    const teamRow = page.locator('tr', { hasText: victimTeam });
    await expect(teamRow).toBeVisible();

    const deleteBtn = teamRow.locator('button[title*="Delete" i], button.danger').last();

    // 2. Test Dismissing the confirmation dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain(`Are you sure you want to disqualify/delete '${victimTeam}'?`);
      await dialog.dismiss();
    });
    await deleteBtn.click();
    await page.waitForTimeout(500);

    // Team should still be present
    await expect(teamRow).toBeVisible();

    // 3. Test Accepting the confirmation dialog
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain(`Are you sure you want to disqualify/delete '${victimTeam}'?`);
      await dialog.accept();
    });
    await deleteBtn.click();
    await page.waitForTimeout(1000);

    // Team should be deleted and removed from the table
    await expect(teamRow).not.toBeVisible();
  });

  test('02. Exact Score Override - Modifying team score with absolute value', async ({ page }) => {
    const scoreTeam = `ScoreSquad_${Date.now().toString().slice(-6)}`;
    await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: scoreTeam,
        pin: '3344',
        member1: 'Scorer1',
        member2: 'Scorer2'
      }
    });

    await page.locator('.admin-navbar button', { hasText: 'Sync' }).click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('.admin-search-input input');
    await searchInput.fill(scoreTeam);
    await page.waitForTimeout(500);

    const teamRow = page.locator('tr', { hasText: scoreTeam });
    await expect(teamRow).toBeVisible();

    // Open Control Points modal
    const scoreBtn = teamRow.locator('button[title*="Score" i]').first();
    await scoreBtn.click();

    const scoreModal = page.locator('.admin-modal', { hasText: /Control Points/i });
    await expect(scoreModal).toBeVisible();

    // Fill Exact Score with 850
    const exactInput = scoreModal.locator('input[placeholder*="Leave blank to use Delta"]');
    await exactInput.fill('850');

    // Add reason
    const reasonInput = scoreModal.locator('input[placeholder*="bonus flag"]');
    await reasonInput.fill('Grand Championship Override');

    // Confirm
    await scoreModal.getByRole('button', { name: /Confirm Points/i }).click();
    await page.waitForTimeout(700);
    await expect(scoreModal).not.toBeVisible();

    // Verify team row shows 850
    await expect(teamRow.locator('.score-num')).toContainText('850');
  });

  test('03. Team Secret PIN - Viewing and setting new PIN', async ({ page }) => {
    const pinTeam = `PinSquad_${Date.now().toString().slice(-6)}`;
    await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: pinTeam,
        pin: '4455',
        member1: 'PinAgent1',
        member2: 'PinAgent2'
      }
    });

    await page.locator('.admin-navbar button', { hasText: 'Sync' }).click();
    await page.waitForTimeout(500);

    const searchInput = page.locator('.admin-search-input input');
    await searchInput.fill(pinTeam);
    await page.waitForTimeout(500);

    const teamRow = page.locator('tr', { hasText: pinTeam });
    await expect(teamRow).toBeVisible();

    // Click PIN button
    const pinBtn = teamRow.locator('button[title*="PIN" i]').first();
    await pinBtn.click();

    const pinModal = page.locator('.admin-modal', { hasText: /Team Secret PIN/i });
    await expect(pinModal).toBeVisible();
    await expect(pinModal.getByText('4455')).toBeVisible();

    // Update to 9876
    const newPinInput = pinModal.locator('input[placeholder*="PIN"]');
    await newPinInput.fill('9876');

    await pinModal.getByRole('button', { name: /Save New PIN/i }).click();
    await page.waitForTimeout(700);
    await expect(pinModal).not.toBeVisible();

    // Click again to verify updated PIN is 9876
    await pinBtn.click();
    await expect(pinModal.getByText('9876')).toBeVisible();
    await pinModal.getByRole('button', { name: /Cancel/i }).click();
    await expect(pinModal).not.toBeVisible();
  });

  test('04. Multi-Round Timers - Custom configuration for Round 2 and Round 3', async ({ page }) => {
    // Switch to Round 2 Tab
    const tabR2 = page.getByRole('button', { name: /Round 2: Image Recon/i });
    await tabR2.click();
    await page.waitForTimeout(300);

    // Click Custom Duration
    const customDurBtn = page.getByRole('button', { name: /Custom Duration/i });
    await customDurBtn.click();

    const durModal = page.locator('.admin-modal', { hasText: /Configure Round 2 Duration/i });
    await expect(durModal).toBeVisible();

    // Click quick select 25 or fill 25
    const durInput = durModal.locator('input[type="number"]');
    await durInput.fill('25');

    await durModal.getByRole('button', { name: /Save Round 2 Duration/i }).click();
    await page.waitForTimeout(600);
    await expect(durModal).not.toBeVisible();

    // Switch to Round 3 Tab
    const tabR3 = page.getByRole('button', { name: /Round 3: Blockly Forest/i });
    await tabR3.click();
    await page.waitForTimeout(300);

    // Configure Round 3
    await customDurBtn.click();
    const durModalR3 = page.locator('.admin-modal', { hasText: /Configure Round 3 Duration/i });
    await expect(durModalR3).toBeVisible();

    const durInputR3 = durModalR3.locator('input[type="number"]');
    await durInputR3.fill('40');

    await durModalR3.getByRole('button', { name: /Save Round 3 Duration/i }).click();
    await page.waitForTimeout(600);
    await expect(durModalR3).not.toBeVisible();
  });

});
