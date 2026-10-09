import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 3 Prologue Protection & Time-based Scoring Verification', () => {

  test('Backend stage 3 submission correctly awards time-based and block-based scores and updates team total score', async ({ request }) => {
    const squad = `R3ScoreSquad_${Date.now().toString().slice(-6)}`;

    // 1. Register team
    const regRes = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squad,
        pin: '5566',
        member1: 'Casey',
        member2: 'Devon'
      }
    });
    expect(regRes.ok()).toBeTruthy();
    const regData = await regRes.json();
    const teamId = regData.team?.id || regData.team_id;
    const token = regData.token;

    // Initial score should be 0
    expect(regData.team?.score || 0).toBe(0);

    // 2. Submit Stage 3 Level 1 with 250 block score + 250 time score = 500 total
    const submitL1 = await request.post('http://localhost:8000/api/teams/stage3/submit', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Team-Id': String(teamId),
        'X-Team-Name': squad
      },
      data: {
        level: 1,
        blocks_used: 14,
        time_used_seconds: 95,
        block_score: 250,
        time_score: 250,
        efficiency: 'Excellent',
        score: 500,
        team_name: squad
      }
    });

    expect(submitL1.ok()).toBeTruthy();
    const l1Data = await submitL1.json();
    expect(l1Data.status).toBe('success');
    expect(l1Data.points_awarded).toBe(500);
    expect(l1Data.round3_score).toBe(500);
    expect(l1Data.new_score).toBe(500);

    // 3. Re-submitting with equal or lower score preserves highest score
    const resubmitLower = await request.post('http://localhost:8000/api/teams/stage3/submit', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Team-Id': String(teamId),
        'X-Team-Name': squad
      },
      data: {
        level: 1,
        blocks_used: 20,
        time_used_seconds: 220,
        block_score: 160,
        time_score: 210,
        efficiency: 'Good',
        score: 370,
        team_name: squad
      }
    });

    expect(resubmitLower.ok()).toBeTruthy();
    const lowerData = await resubmitLower.json();
    expect(lowerData.status).toBe('already_submitted');
    expect(lowerData.new_score).toBe(500);
    expect(lowerData.round3_score).toBe(500);

    // 4. Submit Level 2 with 250 block score + 235 time score = 485 total
    const submitL2 = await request.post('http://localhost:8000/api/teams/stage3/submit', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Team-Id': String(teamId),
        'X-Team-Name': squad
      },
      data: {
        level: 2,
        blocks_used: 17,
        time_used_seconds: 150,
        block_score: 250,
        time_score: 235,
        efficiency: 'Excellent',
        score: 485,
        team_name: squad
      }
    });

    expect(submitL2.ok()).toBeTruthy();
    const l2Data = await submitL2.json();
    expect(l2Data.status).toBe('success');
    expect(l2Data.points_awarded).toBe(485);
    expect(l2Data.round3_score).toBe(985); // 500 + 485
    expect(l2Data.new_score).toBe(985);
  });

  test('Round 3 warning message / anti-cheat does not skip the story prologue', async ({ page }) => {
    test.setTimeout(60000);
    const testSquad = `StorySquad_${Date.now().toString().slice(-6)}`;

    // Setup fresh team session with unfinished story
    await page.addInitScript(({ squad }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '999');
      localStorage.removeItem('cyphora_round3_story_finished');
      localStorage.removeItem(`cyphora_round3_story_finished_999`);
      localStorage.removeItem(`cyphora_round3_story_finished_default`);
      sessionStorage.setItem('cyphora_team_name', squad);
      sessionStorage.setItem('cyphora_team_id', '999');
      sessionStorage.removeItem('cyphora_round3_story_finished');
      sessionStorage.removeItem(`cyphora_round3_story_finished_999`);
    }, { squad: testSquad });

    // Navigate to Round 3 standalone page
    await page.goto('/round3/index.html');

    // Click "Enter The Temple" on LandingScreen
    const enterBtn = page.locator('button:has-text("Enter The Temple")');
    await expect(enterBtn).toBeVisible({ timeout: 15000 });
    await enterBtn.click();

    // Verify StoryIntro title and scene 1 image are visible
    const storyHeading = page.locator('h1:has-text("THE TEMPLE TRIALS")');
    await expect(storyHeading).toBeVisible({ timeout: 10000 });
    const scene1Img = page.locator('img[alt*="THE APPROACH"]');
    await expect(scene1Img).toBeVisible();

    // Simulate security warning / AntiCheat trigger via security keydown event (e.g. F5 / reload restriction)
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F5', keyCode: 116, bubbles: true, cancelable: true }));
    });

    // Verify AntiCheatScreen overlay appears with recovery password prompt
    const blueScreen = page.locator('.blue-screen-gate');
    await expect(blueScreen).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Your PC ran into a problem and was locked')).toBeVisible();

    // Unlock the security warning screen using authorized code '1234'
    const recoveryInput = page.locator('#recovery-password');
    await expect(recoveryInput).toBeVisible();
    await recoveryInput.fill('1234');
    await page.keyboard.press('Enter');

    // Security warning screen must dismiss
    await expect(blueScreen).toBeHidden({ timeout: 5000 });

    // CRITICAL: Story prologue MUST NOT have been skipped!
    // Scene 1 text and header must still be visible and present
    await expect(storyHeading).toBeVisible();
    await expect(scene1Img).toBeVisible();

    // Wait for the advance countdown (3s) and verify the story can advance normally
    const advanceBtn = page.locator('button:has-text("Continue To Next Scene")');
    await expect(advanceBtn).toBeVisible({ timeout: 10000 });
    await advanceBtn.click();

    // Verify Scene 2 is displayed (not skipped to end!)
    const scene2Img = page.locator('img[alt*="THE RUINS"]');
    await expect(scene2Img).toBeVisible({ timeout: 5000 });
  });

});
