import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 3 Time Expired Leaderboard Flow', () => {

  test('01. When Round 3 timer expires before completing trials, displays championship leaderboard', async ({ page }) => {
    test.setTimeout(45000);
    const squadName = `R3TimeoutSquad_${Date.now().toString().slice(-4)}`;
    const threeHoursAgo = String(Date.now() - (3 * 60 * 60 * 1000));

    await page.addInitScript(({ squad, startTime }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '999');
      localStorage.setItem('cyphora_team_score', '1350');
      localStorage.setItem('cyphora_round1_score', '500');
      localStorage.setItem('cyphora_round2_score', '350');
      localStorage.setItem('cyphora_round3_score', '500');
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      localStorage.setItem('cyphora_round3_story_finished_999', 'true');
      localStorage.setItem('cyphora_round3_started_at', startTime);
      localStorage.setItem('cyphora_round3_started_at_999', startTime);
      // Notice: cyphora_round3_completed is NOT set! Tasks are not completed!
    }, { squad: squadName, startTime: threeHoursAgo });

    await page.goto('/round3/index.html');

    // Enter if landing screen is shown
    const enterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await enterBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await enterBtn.click();
    }

    // Verify Time Expired Header is visible
    const expiredHeader = page.locator('h1:has-text("ROUND 3 TIME EXPIRED")');
    await expect(expiredHeader).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=The temple gates have closed before all trials were completed')).toBeVisible();

    // Verify Championship Leaderboard appears
    await expect(page.locator('text=EXPEDITION LEADERBOARD')).toBeVisible();

    // Verify user squad is present and highlighted with YOU badge
    const userRow = page.locator('table').locator(`text=${squadName}`);
    await expect(userRow).toBeVisible();
    await expect(page.locator('span:has-text("YOU")').first()).toBeVisible();

    // Verify column headers exist
    await expect(page.locator('th:has-text("RANK")')).toBeVisible();
    await expect(page.locator('th:has-text("EXPEDITION TEAM")')).toBeVisible();
    await expect(page.locator('th:has-text("R1")')).toBeVisible();
    await expect(page.locator('th:has-text("R2")')).toBeVisible();
    await expect(page.locator('th:has-text("R3")')).toBeVisible();
    await expect(page.locator('th:has-text("TOTAL PTS")')).toBeVisible();

    // Verify team search works
    const searchInput = page.locator('input[placeholder*="Filter teams"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(squadName);
    await expect(page.locator('table').locator(`text=${squadName}`)).toBeVisible();

    // Verify Proctor Unlock form can unlock the station
    const proctorBtn = page.locator('button:has-text("Proctor Unlock")');
    await expect(proctorBtn).toBeVisible();
    await proctorBtn.click();

    const codeInput = page.locator('input[placeholder*="Supervisor Access Code"]');
    await expect(codeInput).toBeVisible();
    await codeInput.fill('JCEAIML');
    await page.getByRole('button', { name: 'Unlock', exact: true }).click();

    // Once unlocked, the time-expired lock is dismissed and the workstation canvas returns
    await expect(expiredHeader).not.toBeVisible({ timeout: 10000 });
  });

});
