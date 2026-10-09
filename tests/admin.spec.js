import { test, expect } from '@playwright/test';

test.describe('CYPHORA Admin Command Portal', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to admin portal
    await page.goto('/admin');
  });

  test('01. Authentication - Handles invalid password and authenticates with master password', async ({ page }) => {
    // Verify admin login screen components
    await expect(page.locator('.admin-login-screen')).toBeVisible();
    await expect(page.getByText('EXPEDITION CONTROL')).toBeVisible();
    await expect(page.locator('.pin-mask-input')).toBeVisible();

    // 1. Submit invalid password
    const passInput = page.locator('input[name="master_admin_token"]');
    await passInput.fill('WRONG_PASSWORD_XYZ');
    await page.locator('.admin-login-btn').click();

    // Expect login error banner
    await expect(page.locator('.admin-login-error')).toBeVisible();
    await expect(page.locator('.admin-login-error')).toContainText('Invalid Administrator Password');

    // 2. Submit valid master password
    await passInput.fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Expect successful transition to Admin Command Center
    await expect(page.locator('.admin-navbar')).toBeVisible();
    await expect(page.getByText('CYPHORA // ADMIN COMMAND')).toBeVisible();
    await expect(page.locator('.admin-live-chip')).toBeVisible();
  });

  test('02. Session Persistence & Logout / Lock', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();
    await expect(page.locator('.admin-navbar')).toBeVisible();

    // Reload page -> should stay authenticated via stored token
    await page.reload();
    await expect(page.locator('.admin-navbar')).toBeVisible();
    await expect(page.getByText('CYPHORA // ADMIN COMMAND')).toBeVisible();

    // Click Lock / Logout button
    const lockBtn = page.locator('button[title="Lock Admin Portal"]');
    await expect(lockBtn).toBeVisible();
    await lockBtn.click();

    // Expect return to login screen
    await expect(page.locator('.admin-login-screen')).toBeVisible();
    await expect(page.getByText('EXPEDITION CONTROL')).toBeVisible();
  });

  test('03. Telemetry Metrics Cards & Data Sync', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();
    await expect(page.locator('.admin-navbar')).toBeVisible();

    // Verify telemetry cards
    await expect(page.getByText('Registered Teams')).toBeVisible();
    await expect(page.getByText('Online Stations')).toBeVisible();
    await expect(page.getByText('Top Total Score')).toBeVisible();
    await expect(page.getByText('Database Engine')).toBeVisible();
    await expect(page.getByText('SQLite WAL')).toBeVisible();

    // Verify Sync button functions smoothly
    const syncBtn = page.locator('.admin-navbar button', { hasText: 'Sync' });
    await expect(syncBtn).toBeVisible();
    await syncBtn.click();
    await page.waitForTimeout(500);
    await expect(page.locator('.admin-metrics-grid')).toBeVisible();
  });

  test('04. Multi-Round Timers Hub - Tabs, Presets, Controls & Custom Modal', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Verify Timer Hub title
    await expect(page.getByText('ROUND DURATION CONFIGURATION')).toBeVisible();

    // 1. Switch between Round tabs
    const tabR1 = page.getByRole('button', { name: /Round 1: Virtual OS/i });
    const tabR2 = page.getByRole('button', { name: /Round 2: Image Recon/i });
    const tabR3 = page.getByRole('button', { name: /Round 3: Blockly Forest/i });

    await expect(tabR1).toBeVisible();
    await expect(tabR2).toBeVisible();
    await expect(tabR3).toBeVisible();

    // Click Round 2 Tab
    await tabR2.click();
    await expect(page.locator('.timer-clock-display')).toBeVisible();

    // Click Round 3 Tab
    await tabR3.click();
    await expect(page.locator('.timer-clock-display')).toBeVisible();

    // Switch back to Round 1 Tab
    await tabR1.click();

    // 2. Click Quick Preset Chips
    const preset30m = page.getByRole('button', { name: '30m' });
    if (await preset30m.isVisible()) {
      await preset30m.click();
      await page.waitForTimeout(500);
    }

    // 3. Test Custom Duration Modal
    const customDurBtn = page.getByRole('button', { name: /Custom Duration/i });
    await expect(customDurBtn).toBeVisible();
    await customDurBtn.click();

    // Modal should be open
    await expect(page.getByText(/Configure Round 1 Duration/i)).toBeVisible();
    const durInput = page.locator('.admin-modal input[type="number"]');
    await expect(durInput).toBeVisible();
    await durInput.fill('45');

    // Click Save Round 1 Duration
    await page.getByRole('button', { name: /Save Round 1 Duration/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByText(/Configure Round 1 Duration/i)).not.toBeVisible();

    // 4. Test Emergency Pause / Resume button
    const emergencyPauseBtn = page.locator('button.timer-ctrl-btn.pause');
    if (await emergencyPauseBtn.isVisible()) {
      await emergencyPauseBtn.click();
      await page.waitForTimeout(500);
      // Now should show Resume Workstations
      const resumeBtn = page.locator('button.timer-ctrl-btn.primary');
      await expect(resumeBtn).toBeVisible();
      await resumeBtn.click();
      await page.waitForTimeout(500);
    }
  });

  test('05. Live Activity Feed & Score Audit Accordion', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Locate Activity Stream Accordion Header
    const feedHeader = page.locator('.global-feed-toggle-row');
    await expect(feedHeader).toBeVisible();
    await expect(page.getByText('TOURNAMENT SCORE AUDIT & LIVE ACTIVITY STREAM')).toBeVisible();

    // Click to expand
    await feedHeader.click();
    await page.waitForTimeout(500);

    // Filter pills should be visible inside feed
    await expect(page.getByRole('button', { name: 'All Rounds' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stage 1' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stage 2' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Stage 3' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Admin Adjustments' })).toBeVisible();

    // Click different filter pills
    await page.getByRole('button', { name: 'Stage 1' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Admin Adjustments' }).click();
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'All Rounds' }).click();

    // Test Feed Search box
    const feedSearch = page.locator('input[placeholder="Search by team or task..."]');
    await expect(feedSearch).toBeVisible();
    await feedSearch.fill('task');
    await page.waitForTimeout(300);
    await feedSearch.fill('');

    // Click again to collapse
    await feedHeader.click();
  });

  test('06. Teams Table - Search, Filtering & Column Sorting', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Verify Toolbar
    const searchInput = page.locator('.admin-search-input input');
    await expect(searchInput).toBeVisible();

    // Search query
    await searchInput.fill('NonExistentTeamSearch_123');
    await page.waitForTimeout(300);
    await expect(page.getByText('Showing 0 of')).toBeVisible();

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Filter pills
    const pillOnline = page.getByRole('button', { name: /^Online \(/i });
    const pillIdle = page.getByRole('button', { name: /^Idle \(/i });
    const pillAll = page.getByRole('button', { name: /^All \(/i });

    if (await pillOnline.isVisible()) await pillOnline.click();
    if (await pillIdle.isVisible()) await pillIdle.click();
    if (await pillAll.isVisible()) await pillAll.click();

    // Table Header Sorting
    const rankHeader = page.locator('th.sortable', { hasText: 'Rank' });
    const nameHeader = page.locator('th.sortable', { hasText: 'Team Name' });
    const scoreHeader = page.locator('th.sortable', { hasText: 'Total Score' });

    await expect(rankHeader).toBeVisible();
    await rankHeader.click();
    await page.waitForTimeout(200);
    await nameHeader.click();
    await page.waitForTimeout(200);
    await scoreHeader.click();
    await page.waitForTimeout(200);
  });

  test('07. Team Management Modals & Operations', async ({ page }) => {
    // First, let's create a known team via the backend API if none exists so we have a reliable team to test with
    const testTeamName = `AdmTest_${Date.now().toString().slice(-6)}`;
    await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: testTeamName,
        pin: '1234',
        member1: 'AgentOne',
        member2: 'AgentTwo'
      }
    });

    // Login to Admin
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Search for our created test team
    const searchInput = page.locator('.admin-search-input input');
    await searchInput.fill(testTeamName);
    await page.waitForTimeout(500);

    const teamRow = page.locator('tr', { hasText: testTeamName });
    await expect(teamRow).toBeVisible();

    // 1. Quick Score Button (+20)
    const plus20Btn = teamRow.locator('button', { hasText: '+20' });
    if (await plus20Btn.isVisible()) {
      await plus20Btn.click();
      await page.waitForTimeout(700);
    }

    // 2. Custom Score Modal
    const scoreBtn = teamRow.locator('button[title*="Custom Score" i]');
    if (await scoreBtn.first().isVisible()) {
      await scoreBtn.first().click();
      const scoreModal = page.locator('.admin-modal', { hasText: /Control Points/i });
      // Click +50 delta preset chip
      await scoreModal.getByRole('button', { name: '+50' }).click();

      // Enter Reason
      const reasonInput = scoreModal.locator('input[type="text"]').last();
      await reasonInput.fill('Playwright test bonus');

      // Confirm
      await scoreModal.getByRole('button', { name: /Confirm Points/i }).click();
      await page.waitForTimeout(700);
    }

    // 3. Team Secret PIN Modal
    const pinBtn = teamRow.locator('button[title*="Reset / Update Team PIN" i]');
    if (await pinBtn.first().isVisible()) {
      await pinBtn.first().click();
      const pinModal = page.locator('.admin-modal', { hasText: /Team Secret PIN/i });
      await expect(pinModal).toBeVisible();

      const newPinInput = pinModal.locator('input[placeholder*="PIN"]');
      await newPinInput.fill('5678');
      await pinModal.getByRole('button', { name: /Save New PIN/i }).click();
      await page.waitForTimeout(700);
      await expect(pinModal).not.toBeVisible();
    }

    // 4. Edit Team Modal
    const editBtn = teamRow.locator('button[title*="Edit" i]');
    if (await editBtn.first().isVisible()) {
      await editBtn.first().click();
      const editModal = page.locator('.admin-modal', { hasText: /Edit Workstation Team/i });
      await expect(editModal).toBeVisible();

      const member1Input = editModal.locator('input[placeholder*="Alex"]');
      await member1Input.fill('UpdatedAgent1');
      await editModal.getByRole('button', { name: /Save Team/i }).click();
      await page.waitForTimeout(700);
      await expect(editModal).not.toBeVisible();
    }

    // 5. Annotate / Notes Modal
    const noteBtn = teamRow.locator('button[title*="Note" i], button[title*="Flag" i]');
    if (await noteBtn.first().isVisible()) {
      await noteBtn.first().click();
      const noteModal = page.locator('.admin-modal', { hasText: /Annotate Team/i });
      await expect(noteModal).toBeVisible();

      // Click a tag pill
      await noteModal.getByRole('button', { name: '[Verified Station]' }).click();
      await noteModal.getByRole('button', { name: /Save Note/i }).click();
      await page.waitForTimeout(700);
      await expect(noteModal).not.toBeVisible();
    }

    // 6. Score Audit Modal
    const auditBtn = teamRow.locator('button[title*="Audit" i], button:has-text("Audit")');
    if (await auditBtn.first().isVisible()) {
      await auditBtn.first().click();
      const auditModal = page.locator('.admin-modal', { hasText: /Score Audit Breakdown/i });
      await expect(auditModal).toBeVisible();
      await auditModal.getByRole('button', { name: 'Close Audit' }).click();
      await expect(auditModal).not.toBeVisible();
    }

    // 7. Toggle Round 2 Access button
    const r2ToggleBtn = teamRow.locator('button[title*="Round 2" i]');
    if (await r2ToggleBtn.first().isVisible()) {
      await r2ToggleBtn.first().click();
      await page.waitForTimeout(700);
    }

    // 8. Toggle Round 3 Access button
    const r3ToggleBtn = teamRow.locator('button[title*="Round 3" i]');
    if (await r3ToggleBtn.first().isVisible()) {
      await r3ToggleBtn.first().click();
      await page.waitForTimeout(700);
    }
  });

  test('08. Data Export & Backup Features', async ({ page }) => {
    // Login
    await page.locator('input[name="master_admin_token"]').fill('JCEAIML');
    await page.locator('.admin-login-btn').click();

    // Verify Export CSV button
    const exportCsvBtn = page.getByRole('button', { name: /Export CSV/i });
    await expect(exportCsvBtn).toBeVisible();

    // Verify JSON Dump button
    const jsonDumpBtn = page.getByRole('button', { name: /JSON Dump/i });
    await expect(jsonDumpBtn).toBeVisible();

    // Test Backup Snapshot button (handles alert)
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Backup snapshot');
      await dialog.accept();
    });
    const backupBtn = page.getByRole('button', { name: /Backup Snapshot/i });
    await expect(backupBtn).toBeVisible();
    await backupBtn.click();
    await page.waitForTimeout(1000);
  });
});
