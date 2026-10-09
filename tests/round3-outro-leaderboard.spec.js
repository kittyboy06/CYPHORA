import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 3 Outro Story to Leaderboard Transition', () => {

  test('Direct load with isExpeditionCompleted immediately renders Finale Leaderboard', async ({ page }) => {
    test.setTimeout(45000);
    const directSquad = `DirectSquad_${Date.now().toString().slice(-4)}`;

    await page.addInitScript(({ squad }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '888');
      localStorage.setItem('cyphora_team_score', '1950');
      localStorage.setItem('cyphora_round1_score', '500');
      localStorage.setItem('cyphora_round2_score', '200');
      localStorage.setItem('cyphora_round3_score', '1250');
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      localStorage.setItem('cyphora_round3_story_finished_888', 'true');
      localStorage.setItem('cyphora_round3_completed', 'true');
      localStorage.setItem('cyphora_round3_completed_888', 'true');
    }, { squad: directSquad });

    await page.goto('/round3/index.html');

    // Click Enter The Temple if landing screen is shown
    const enterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await enterBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await enterBtn.click();
    }

    // Should immediately display the Finale Leaderboard
    const finaleTitle = page.locator('h1:has-text("THE LIGHT OF CYPHORA")');
    await expect(finaleTitle).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Grand Finale // Outro Complete')).toBeVisible();

    // Verify user squad highlight in summary and table
    await expect(page.locator(`text=${directSquad}`).first()).toBeVisible();
    await expect(page.locator('table').locator(`text=${directSquad}`)).toBeVisible();
    await expect(page.locator('text=1950 PTS').first()).toBeVisible();
    await expect(page.locator('span:has-text("YOU")').first()).toBeVisible();

    // Verify standings table headers
    await expect(page.locator('th:has-text("RANK")')).toBeVisible();
    await expect(page.locator('th:has-text("EXPLORER SQUAD")')).toBeVisible();
    await expect(page.locator('th:has-text("TOTAL SCORE")')).toBeVisible();
    await expect(page.locator('th:has-text("STATUS")')).toBeVisible();

    // Test search filter
    const searchInput = page.locator('input[placeholder*="Search squad"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill(directSquad);
    await expect(page.locator('table').locator(`text=${directSquad}`)).toBeVisible();

    // Verify Epilogue Lore tab switching
    const loreTab = page.locator('button:has-text("Epilogue Lore")');
    await expect(loreTab).toBeVisible();
    await loreTab.click();
    await expect(page.locator('text=THE CIPHER RESOLVED')).toBeVisible();

    // Switch back to Leaderboard tab
    const lbTab = page.locator('button:has-text("Leaderboard")');
    await expect(lbTab).toBeVisible();
    await lbTab.click();
    await expect(page.locator('th:has-text("EXPLORER SQUAD")')).toBeVisible();

    // Verify action buttons exist
    await expect(page.locator('button:has-text("Replay Outro Story")')).toBeVisible();
    await expect(page.locator('button:has-text("Review Trials & Sandbox")')).toBeVisible();
    await expect(page.locator('button:has-text("Return To Workstation Desktop")')).toBeVisible();
  });

  test('Transitions from Outro Story to Finale Leaderboard upon completion', async ({ page }) => {
    test.setTimeout(45000);
    const storySquad = `StorySquad_${Date.now().toString().slice(-4)}`;

    await page.addInitScript(({ squad }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '777');
      localStorage.setItem('cyphora_team_score', '2150');
      localStorage.setItem('cyphora_round1_score', '650');
      localStorage.setItem('cyphora_round2_score', '250');
      localStorage.setItem('cyphora_round3_score', '1250');
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      localStorage.setItem('cyphora_round3_story_finished_777', 'true');
      localStorage.setItem('cyphora_round3_completed', 'true');
      localStorage.setItem('cyphora_round3_completed_777', 'true');
    }, { squad: storySquad });

    await page.goto('/round3/index.html');

    // Click Enter The Temple if landing screen is shown
    const enterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await enterBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await enterBtn.click();
    }

    // Leaderboard initially displays because completed is set
    await expect(page.locator('h1:has-text("THE LIGHT OF CYPHORA")')).toBeVisible({ timeout: 10000 });

    // Click "🎬 Replay Outro Story" button to launch the outro story
    const replayBtn = page.locator('button:has-text("Replay Outro Story")');
    await expect(replayBtn).toBeVisible();
    await replayBtn.click();

    // Outro Story is now visible
    const outroTitle = page.locator('h1:has-text("INTO THE LIGHT")');
    await expect(outroTitle).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=Expedition Epilogue // The Finale')).toBeVisible();
    await expect(page.locator('img[alt*="1. THE FINAL APPROACH"]')).toBeVisible();

    // Skip to finale or complete story using Skip button
    const skipBtn = page.locator('button:has-text("Skip ⏩")');
    await expect(skipBtn).toBeVisible();
    await skipBtn.click();

    // After outro completion, must transition back to Finale Leaderboard!
    await expect(page.locator('h1:has-text("THE LIGHT OF CYPHORA")')).toBeVisible({ timeout: 8000 });
    await expect(page.locator(`text=${storySquad}`).first()).toBeVisible();
    await expect(page.locator('table').locator(`text=${storySquad}`)).toBeVisible();
    await expect(page.locator('text=2150 PTS').first()).toBeVisible();
    await expect(page.locator('span:has-text("YOU")').first()).toBeVisible();
  });

});
