import { test, expect } from '@playwright/test';

test.describe('CYPHORA Round 3 Participant Stage Instructions Suite', () => {

  test('01. Participant can view and interact with Stage Instructions in Task Strip and Modal', async ({ page }) => {
    test.setTimeout(45000);
    const testSquad = `Squad_${Date.now().toString().slice(-4)}`;

    await page.addInitScript(({ squad }) => {
      localStorage.setItem('cyphora_team_name', squad);
      localStorage.setItem('cyphora_team_id', '505');
      localStorage.setItem('cyphora_round3_story_finished', 'true');
      localStorage.setItem('cyphora_round3_story_finished_505', 'true');
    }, { squad: testSquad });

    await page.goto('/round3/index.html');

    // Click Enter The Temple if landing screen is shown
    const enterBtn = page.locator('button:has-text("Enter The Temple")');
    if (await enterBtn.isVisible({ timeout: 4000 }).catch(() => false)) {
      await enterBtn.click();
    }

    // 1. Verify Task Strip displays detailed instruction text
    await expect(page.locator('text=The Broken Bridge (Stage 1 of 3)')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Triangular Progression').first()).toBeVisible();
    await expect(page.locator('text=Low-hanging canopy vines block jumping on solid ground')).toBeVisible();

    // 2. Verify "📜 Stage Instructions" button is present and click it
    const instructionsBtn = page.locator('button:has-text("Stage Instructions")');
    await expect(instructionsBtn).toBeVisible();
    await instructionsBtn.click();

    // 3. Modal opens with Participant Field Guide and Stage 1 by default
    await expect(page.locator('text=Participant Field Guide')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2:has-text("Detailed Stage Instructions & Mechanics")')).toBeVisible();
    await expect(page.locator('text=MISSION OBJECTIVE: CROSS THE EXPANDING AQUEDUCT')).toBeVisible();
    await expect(page.locator('text=The Triangular Sequence Pattern')).toBeVisible();
    await expect(page.locator('text=Fatal Hazard: Low-Hanging Jungle Vines')).toBeVisible();

    // 4. Switch to Stage 2 tab
    const stage2Tab = page.locator('button:has-text("Stage 2: The Beast\'s Lair")');
    await expect(stage2Tab).toBeVisible();
    await stage2Tab.click();

    await expect(page.locator('text=MISSION OBJECTIVE: ARM YOURSELF & DEFEAT THE GUARDIAN')).toBeVisible();
    await expect(page.locator('text=Collect the Ancient Sword (Tile Index 2)')).toBeVisible();
    await expect(page.locator('text=Collect the Guardian Shield (Tile Index 4)')).toBeVisible();
    await expect(page.locator('text=Advance to Standoff Combat Line (Tile Index 18)')).toBeVisible();

    // 5. Switch to Stage 3 tab
    const stage3Tab = page.locator('button:has-text("Stage 3: The Path of Trials")');
    await expect(stage3Tab).toBeVisible();
    await stage3Tab.click();

    await expect(page.locator('text=MISSION OBJECTIVE: AWAKEN THE 3 SACRED ELEMENTAL TOTEMS')).toBeVisible();
    await expect(page.locator('text=The 14-Step Obstacle Modulo Rules')).toBeVisible();
    await expect(page.locator('text=i % 3 == 0 (Fire)')).toBeVisible();
    await expect(page.locator('text=i % 5 == 0 (Goblin)')).toBeVisible();
    await expect(page.locator('text=Activating the Totem (Crucial Placement Rule)')).toBeVisible();

    // 6. Close Modal
    const closeBtn = page.locator('button:has-text("Got It // Return to Editor")');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(page.locator('text=Participant Field Guide')).not.toBeVisible();
  });

});
