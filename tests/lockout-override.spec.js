import { test, expect } from '@playwright/test';

test.describe('CYPHORA Workstation Lockout & Proctor Override Suite', () => {

  test('01. Round 1 Lock Screen appears when timer expires and enforces security freeze', async ({ page }) => {
    const squadName = `LockoutTeam_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '9900',
        member1: 'LockoutAgent1',
        member2: 'LockoutAgent2'
      }
    });
    const regData = await regRes.json();

    // Set started_at to 3 hours ago (10800000ms ago) so remaining time is <= 0
    const threeHoursAgo = String(Date.now() - (3 * 60 * 60 * 1000));
    const teamIdStr = String(regData.team_id);

    await page.addInitScript(({ token, teamId, teamName, startTime }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', teamId);
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');

      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', teamId);
      localStorage.setItem('cyphora_team_name', teamName);
      localStorage.setItem('cyphora_round1_started_at', startTime);
      localStorage.setItem(`cyphora_round1_started_at_${teamId}`, startTime);
    }, { token: regData.token, teamId: teamIdStr, teamName: squadName, startTime: threeHoursAgo });

    await page.goto('/');

    // Verify the RoundTimerLockScreen appears
    const lockScreen = page.locator('.round-timer-lockscreen-root');
    await expect(lockScreen).toBeVisible({ timeout: 15000 });

    // Verify lock screen details
    await expect(page.locator('#lock-heading')).toContainText('TIME HAS EXPIRED');
    await expect(page.locator('.lockscreen-round-sub')).toContainText('ROUND 1');
    await expect(page.locator('.diag-val.highlight')).toContainText(squadName);
    await expect(page.locator('.diag-val.code-text')).toContainText('CYPHORA_ROUND_1_TIME_EXPIRED');
    await expect(page.getByText('PLEASE CONTACT THE ADMINISTRATOR')).toBeVisible();

    // Verify inputs exist
    const keyInput = page.locator('input.override-key-input');
    const unlockBtn = page.locator('button.override-submit-btn');
    await expect(keyInput).toBeVisible();
    await expect(unlockBtn).toBeVisible();
  });

  test('02. Lock Screen rejects invalid override keys with clear security feedback', async ({ page }) => {
    const squadName = `InvalidOverride_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '9911',
        member1: 'AgentA',
        member2: 'AgentB'
      }
    });
    const regData = await regRes.json();
    const threeHoursAgo = String(Date.now() - (3 * 60 * 60 * 1000));
    const teamIdStr = String(regData.team_id);

    await page.addInitScript(({ token, teamId, teamName, startTime }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', teamId);
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', teamId);
      localStorage.setItem('cyphora_team_name', teamName);
      localStorage.setItem('cyphora_round1_started_at', startTime);
      localStorage.setItem(`cyphora_round1_started_at_${teamId}`, startTime);
    }, { token: regData.token, teamId: teamIdStr, teamName: squadName, startTime: threeHoursAgo });

    await page.goto('/');

    const lockScreen = page.locator('.round-timer-lockscreen-root');
    await expect(lockScreen).toBeVisible({ timeout: 15000 });

    const keyInput = page.locator('input.override-key-input');
    const unlockBtn = page.locator('button.override-submit-btn');

    // 1. Submit empty key -> should request entry
    await unlockBtn.click();
    await expect(page.locator('.override-error-msg')).toContainText('Please enter administrator override key');

    // 2. Submit wrong key -> should display Access Denied
    await keyInput.fill('INCORRECT_CODE_999');
    await unlockBtn.click();
    await expect(page.locator('.override-error-msg')).toContainText('Access Denied: Invalid administrator override key');

    // Workstation remains locked
    await expect(lockScreen).toBeVisible();
  });

  test('03. Master Proctor Key (JCEAIML) authorizes workstation unlock and restores OS desktop', async ({ page }) => {
    const squadName = `MasterUnlock_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '9922',
        member1: 'MasterAgent1',
        member2: 'MasterAgent2'
      }
    });
    const regData = await regRes.json();
    const threeHoursAgo = String(Date.now() - (3 * 60 * 60 * 1000));
    const teamIdStr = String(regData.team_id);

    await page.addInitScript(({ token, teamId, teamName, startTime }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', teamId);
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', teamId);
      localStorage.setItem('cyphora_team_name', teamName);
      localStorage.setItem('cyphora_round1_started_at', startTime);
      localStorage.setItem(`cyphora_round1_started_at_${teamId}`, startTime);
    }, { token: regData.token, teamId: teamIdStr, teamName: squadName, startTime: threeHoursAgo });

    await page.goto('/');

    const lockScreen = page.locator('.round-timer-lockscreen-root');
    await expect(lockScreen).toBeVisible({ timeout: 15000 });

    // Submit Master Proctor Code: JCEAIML
    const keyInput = page.locator('input.override-key-input');
    await keyInput.fill('JCEAIML');
    await page.locator('button.override-submit-btn').click();

    // Verify verification feedback
    await expect(page.locator('.override-success-msg')).toContainText('Override Verified');

    // Lock screen dismisses and restores desktop
    await expect(lockScreen).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('.os-desktop-root')).toBeVisible();
  });

  test('04. Alternate Proctor Code (8080) also successfully authorizes workstation unlock', async ({ page }) => {
    const squadName = `ProctorUnlock_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '9933',
        member1: 'ProctorAgent1',
        member2: 'ProctorAgent2'
      }
    });
    const regData = await regRes.json();
    const threeHoursAgo = String(Date.now() - (3 * 60 * 60 * 1000));
    const teamIdStr = String(regData.team_id);

    await page.addInitScript(({ token, teamId, teamName, startTime }) => {
      sessionStorage.setItem('cyphora_token', token);
      sessionStorage.setItem('cyphora_team_id', teamId);
      sessionStorage.setItem('cyphora_team_name', teamName);
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      localStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_team_id', teamId);
      localStorage.setItem('cyphora_team_name', teamName);
      localStorage.setItem('cyphora_round1_started_at', startTime);
      localStorage.setItem(`cyphora_round1_started_at_${teamId}`, startTime);
    }, { token: regData.token, teamId: teamIdStr, teamName: squadName, startTime: threeHoursAgo });

    await page.goto('/');

    const lockScreen = page.locator('.round-timer-lockscreen-root');
    await expect(lockScreen).toBeVisible({ timeout: 15000 });

    // Submit station proctor alternate code: 8080
    await page.locator('input.override-key-input').fill('8080');
    await page.locator('button.override-submit-btn').click();

    await expect(page.locator('.override-success-msg')).toContainText('Override Verified');
    await expect(lockScreen).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('.os-desktop-root')).toBeVisible();
  });

});
