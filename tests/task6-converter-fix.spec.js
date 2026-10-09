import { test, expect } from '@playwright/test';

test.describe('Task 6 & Universal Converter Q1lQ / QyhQ / c(phora Fix Suite', () => {

  test('Universal Converter auto-heals QyhQSE9SQQ== to CYPHORA and handles whitespace', async ({ page }) => {
    const squadName = `T6Squad_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '4321',
        member1: 'AgentA',
        member2: 'AgentB'
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

    // Minimize or close objective modal if open so it doesn't intercept clicks
    const closeBtn = page.locator('button[aria-label*="Close"], button[aria-label*="Minimize"]').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }

    // Open Universal Converter from desktop icon
    const convIcon = page.locator('.desktop-icon-cell', { hasText: 'Universal Converter' });
    await convIcon.dblclick();

    const convWin = page.locator('.window-frame', { hasText: 'Universal Converter' });
    await expect(convWin).toBeVisible();

    const fromPills = convWin.locator('.from-pills');
    const toPills = convWin.locator('.to-pills');
    const inputArea = convWin.locator('textarea.converter-textarea').first();
    const outputArea = convWin.locator('textarea.output-box');
    const convertBtn = convWin.locator('button.convert-action-btn');

    // Switch From -> Base64, To -> Text
    await fromPills.locator('button', { hasText: /^Base64/i }).click();
    await toPills.locator('button', { hasText: /^Text/i }).click();

    // Test 1: Standard Base64 Q1lQSE9SQQ== -> CYPHORA
    await inputArea.fill('Q1lQSE9SQQ==');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('CYPHORA');

    // Test 2: Misread font typo QyhQSE9SQQ== -> CYPHORA (auto-healed!)
    await inputArea.fill('QyhQSE9SQQ==');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('CYPHORA');

    // Test 3: Fragmented with spaces "QyhQ SE9S QQ==" -> CYPHORA
    await inputArea.fill('QyhQ SE9S QQ==');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('CYPHORA');

    // Test 4: Single fragment QyhQ -> CYP
    await inputArea.fill('QyhQ');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('CYP');
  });

  test('Backend accepts c(phora, C(PHORA, and CYPHORA for Task 06', async ({ request }) => {
    // Register squad
    const squadName = `T6Back_${Date.now().toString().slice(-6)}`;
    const regRes = await request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '4321',
        member1: 'Alpha',
        member2: 'Beta'
      }
    });
    const regData = await regRes.json();
    const token = regData.token;

    // Test submitting c(phora
    const submitRes = await request.post('http://localhost:8000/api/stage1/submit', {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        task_key: 'r1_t06',
        proof: 'c(phora'
      }
    });
    expect(submitRes.status()).toBe(200);
    const submitData = await submitRes.json();
    expect(submitData.success).toBe(true);
    expect(submitData.points_awarded).toBe(20);
  });

});
