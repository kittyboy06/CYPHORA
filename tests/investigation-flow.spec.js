import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 1 Technical Investigation Flow & Subsystem Restoration Suite', () => {

  test.beforeEach(async ({ page }) => {
    const squadName = `Investigator_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '7788',
        member1: 'AgentOne',
        member2: 'AgentTwo'
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
    }, { token: regData.token, teamId: regData.team_id, teamName: squadName });

    await page.goto('/');
    await expect(page.locator('.os-desktop-root')).toBeVisible({ timeout: 15000 });
  });

  test('01. Taskboard Window Controls - Minimizing to capsule, Escape key dismiss, and clicking capsule to expand', async ({ page }) => {
    // Initially minimized tab button at bottom-right
    const taskTab = page.locator('button.objective-tab');
    await expect(taskTab).toBeVisible();
    await expect(taskTab).toContainText('TASK 01');

    // Click tab button to expand modal
    await taskTab.click();

    // Verify modal is open
    const modal = page.locator('.objective-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 01 / 12');

    // Press Escape key -> should minimize
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    await expect(taskTab).toBeVisible();

    // Re-open by clicking tab button
    await taskTab.click();
    await expect(modal).toBeVisible();

    // Click minus button on header -> should minimize
    const minusBtn = modal.locator('button[title*="Minimize task"]');
    await minusBtn.click();
    await expect(modal).not.toBeVisible();
    await expect(taskTab).toBeVisible();
  });

  test('02. Task 01 - Hints, score penalty badge updates, and validation error feedback', async ({ page }) => {
    // Open task modal
    const taskTab = page.locator('button.objective-tab');
    await taskTab.click();

    const modal = page.locator('.objective-modal');
    await expect(modal).toBeVisible();

    // 1. Initial points badge should be 20 PTS
    await expect(modal.getByText('20 PTS')).toBeVisible();

    // 2. Submit wrong answer
    const answerInput = modal.locator('input.objective-answer-field');
    await answerInput.fill('INCORRECT_ANSWER');
    await modal.locator('button.objective-submit-button').click();

    // Error feedback
    await expect(modal.locator('.objective-feedback-negative')).toBeVisible();
    await expect(modal.locator('.objective-feedback-negative')).toContainText('Not quite');

    // 3. Reveal Hint 1
    const hintBtn = modal.locator('button.objective-hint-button');
    await expect(hintBtn).toBeVisible();
    await hintBtn.click();

    // Points should now be 15 PTS (-5 HINT)
    await expect(modal.getByText('15 PTS (-5 HINT)')).toBeVisible();
    await expect(modal.locator('.objective-hint-card')).toBeVisible();

    // 4. Reveal Hint 2
    await hintBtn.click();
    await expect(modal.getByText('10 PTS (-10 HINT)')).toBeVisible();

    // 5. Submit correct answer: HIDE
    await answerInput.fill('HIDE');
    await modal.locator('button.objective-submit-button').click();

    // Should show success feedback (+10 PTS EARNED with penalty note)
    await expect(modal.locator('.objective-feedback-positive')).toBeVisible();
    await expect(modal.locator('.objective-feedback-positive')).toContainText('CORRECT (+10 PTS EARNED');

    // Wait for task progression into Task 02
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 02 / 12', { timeout: 10000 });
  });

  test('03. Sequential Investigation: Solving Tasks 1 through 5 restores Subsystem 1 (POWER)', async ({ page }) => {
    // Open Task Board
    await page.locator('button.objective-tab').click();
    const modal = page.locator('.objective-modal');
    await expect(modal).toBeVisible();

    // Helper to submit answer and advance
    const solveCurrentTask = async (answer) => {
      const input = page.locator('.objective-modal input.objective-answer-field');
      await input.fill(answer);
      await page.locator('.objective-modal button.objective-submit-button').click();
      await page.waitForTimeout(600);
    };

    // Task 01 -> Answer: HIDE
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 01 / 12');
    await solveCurrentTask('HIDE');

    // Task 02 -> Answer: ARLO
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 02 / 12', { timeout: 10000 });
    await solveCurrentTask('ARLO');

    // Task 03 -> Answer: SECTOR-7
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 03 / 12', { timeout: 10000 });
    await solveCurrentTask('SECTOR-7');

    // Task 04 -> Answer: YELLOW
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 04 / 12', { timeout: 10000 });
    await solveCurrentTask('YELLOW');

    // Task 05 -> Answer: 9941 (Completes Set 1!)
    await expect(modal.locator('.objective-task-label')).toContainText('TASK 05 / 12', { timeout: 10000 });
    await solveCurrentTask('9941');

    // Subsystem 1 Completion Celebration Toast
    await expect(page.locator('.task-completion-celebration')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.task-completion-toast')).toContainText('POWER SUBSYSTEM RESTORED');

    // Wait for celebration banner to fade or dismiss
    await page.waitForTimeout(3000);

    // Verify HUD reflects Power Grid Online!
    const pwrPill = page.locator('.journey-subsystems-mini .sub-pill', { hasText: 'PWR' });
    await expect(pwrPill).toContainText('ONLINE');
    await expect(pwrPill).toHaveClass(/on/);

    // Verify Route to Light status updated
    await expect(page.locator('.telemetry-status')).toContainText('STATION TERMINALS & SENSORS OPERATIONAL');

    // Now Task 06 should be active
    const nextModal = page.locator('.objective-modal');
    if (await nextModal.isVisible()) {
      await expect(nextModal.locator('.objective-task-label')).toContainText('TASK 06 / 12');
    } else {
      await expect(page.locator('button.objective-tab')).toContainText('TASK 06');
    }
  });

});
