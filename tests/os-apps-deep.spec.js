import { test, expect } from '@playwright/test';

test.describe('CYPHORA OS Desktop Applications & Capabilities Deep Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Generate fresh squad and session to launch directly into os-desktop
    const squadName = `DeepSquad_${Date.now().toString().slice(-6)}`;
    const regRes = await page.request.post('http://localhost:8000/api/auth/register', {
      data: {
        name: squadName,
        pin: '4321',
        member1: 'Alex',
        member2: 'Blake'
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

  test('01. File Manager - Directory navigation, hidden files toggle, properties & quick links', async ({ page }) => {
    // Open File Manager via desktop icon double-click
    const fmIcon = page.locator('.desktop-icon-cell', { hasText: 'File Manager' });
    await fmIcon.dblclick();

    // Verify window opened
    const fmWin = page.locator('.window-frame', { hasText: 'File Manager' });
    await expect(fmWin).toBeVisible();

    // Check Quick Access links
    const sidebar = fmWin.locator('.fm-sidebar');
    await expect(sidebar.getByRole('button', { name: 'Desktop' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Documents' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: 'Archive' })).toBeVisible();

    // Click "Documents" quick link
    await sidebar.getByRole('button', { name: 'Documents' }).click();
    await expect(fmWin.locator('.fm-crumb.active-crumb')).toHaveText('Documents');

    // Click "Up Directory" button to go back to root
    const upBtn = fmWin.locator('button[title="Up Directory"]');
    await upBtn.click();
    await expect(fmWin.locator('.fm-crumb.root-crumb')).toBeVisible();

    // Toggle Hidden Files
    const hiddenToggleBtn = fmWin.locator('.fm-hidden-toggle-btn');
    await expect(hiddenToggleBtn).toContainText('Show Hidden');
    await hiddenToggleBtn.click();
    await expect(hiddenToggleBtn).toContainText('Hidden: ON');

    // Switch view mode between Grid and List
    const listViewBtn = fmWin.locator('button[title="List View"]');
    await listViewBtn.click();
    await expect(fmWin.locator('.fm-list-view')).toBeVisible();

    const gridViewBtn = fmWin.locator('button[title="Grid View"]');
    await gridViewBtn.click();
    await expect(fmWin.locator('.fm-grid-view')).toBeVisible();

    // Select an item and open Properties modal
    const archiveFolder = fmWin.locator('.fm-grid-item', { hasText: 'Archive' });
    await archiveFolder.click();
    const propBtn = fmWin.locator('.fm-footer .inspect-prop-btn', { hasText: 'Properties' });
    await propBtn.click();

    // Verify Properties modal
    const propModal = fmWin.locator('.fm-properties-modal');
    await expect(propModal).toBeVisible();
    await expect(propModal).toContainText('File Properties');
    await expect(propModal).toContainText('/Archive');

    // Close Properties modal
    await propModal.locator('.close-btn').click();
    await expect(propModal).not.toBeVisible();

    // Close File Manager window
    await fmWin.locator('.win-ctrl-close').click();
    await expect(fmWin).not.toBeVisible();
  });

  test('02. Text Editor - Reading, editing, word wrap, and saving via button and Ctrl+S', async ({ page }) => {
    // Open Text Editor from Desktop icon
    const teIcon = page.locator('.desktop-icon-cell', { hasText: 'Text Editor' });
    await teIcon.dblclick();

    const teWin = page.locator('.window-frame', { hasText: 'Text Editor' });
    await expect(teWin).toBeVisible();

    // Verify editor textarea
    const textarea = teWin.locator('textarea.te-textarea');
    await expect(textarea).toBeVisible();

    // Type new text
    await textarea.fill('Testing CYPHORA Text Editor with automated Playwright input.');
    await expect(teWin.locator('.te-dirty-dot')).toBeVisible();

    // Toggle Word Wrap
    const wrapBtn = teWin.locator('button[title="Toggle Word Wrap"]');
    await wrapBtn.click();
    await expect(textarea).toHaveClass(/nowrap/);
    await wrapBtn.click();
    await expect(textarea).toHaveClass(/wrap/);

    // Save using Save button
    const saveBtn = teWin.locator('.te-save-btn');
    await saveBtn.click();
    await expect(teWin.locator('.te-status-badge.success')).toContainText('Saved!');

    // Test Ctrl+S saving
    await textarea.pressSequentially(' More appended text.');
    await page.keyboard.press('Control+s');
    await expect(teWin.locator('.te-status-badge.success')).toContainText('Saved!');

    // Close Text Editor
    await teWin.locator('.win-ctrl-close').click();
    await expect(teWin).not.toBeVisible();
  });

  test('03. Universal Converter - Decimal, Binary, Hex, Color Code conversions and utility controls', async ({ page }) => {
    // Open Universal Converter
    const convIcon = page.locator('.desktop-icon-cell', { hasText: 'Universal Converter' });
    await convIcon.dblclick();

    const convWin = page.locator('.window-frame', { hasText: 'Universal Converter' });
    await expect(convWin).toBeVisible();

    const fromPills = convWin.locator('.from-pills');
    const toPills = convWin.locator('.to-pills');
    const inputArea = convWin.locator('textarea.converter-textarea').first();
    const outputArea = convWin.locator('textarea.output-box');
    const convertBtn = convWin.locator('button.convert-action-btn');

    // 1. Decimal -> Text (72 73 68 69 -> HIDE)
    await fromPills.locator('button', { hasText: /^Decimal/i }).click();
    await toPills.locator('button', { hasText: /^Text/i }).click();
    await inputArea.fill('72 73 68 69');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('HIDE');

    // 2. Binary -> Text
    await fromPills.locator('button', { hasText: /^Binary/i }).click();
    await toPills.locator('button', { hasText: /^Text/i }).click();
    await inputArea.fill('01001000 01001001 01000100 01000101');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('HIDE');

    // 3. Hex -> Text
    await fromPills.locator('button', { hasText: /^Hexadecimal/i }).click();
    await toPills.locator('button', { hasText: /^Text/i }).click();
    await inputArea.fill('48 49 44 45');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('HIDE');

    // 4. Color Code -> Text
    await fromPills.locator('button', { hasText: /^Color Code/i }).click();
    await toPills.locator('button', { hasText: /^Text/i }).click();
    await inputArea.fill('#FFFF00');
    await convertBtn.click();
    await expect(outputArea).toHaveValue('YELLOW');

    // 5. Test Swap Mode Button
    const swapBtn = convWin.locator('button.swap-format-btn');
    await swapBtn.click();
    await page.waitForTimeout(200);

    // 6. Test Clear Button
    const clearBtn = convWin.locator('.footer-btn', { hasText: 'CLEAR' });
    await clearBtn.click();
    await expect(inputArea).toHaveValue('');

    // Close window
    await convWin.locator('.win-ctrl-close').click();
    await expect(convWin).not.toBeVisible();
  });

  test('04. Metadata Inspector - Virtual File Picker, EXIF metadata, Hardware ID & copy action', async ({ page }) => {
    // Open Metadata Inspector
    const metaIcon = page.locator('.desktop-icon-cell', { hasText: 'Metadata Inspector' });
    await metaIcon.dblclick();

    const metaWin = page.locator('.window-frame', { hasText: 'Metadata Inspector' });
    await expect(metaWin).toBeVisible();

    // Click "Browse Virtual OS" to open VirtualFilePicker
    const browseBtn = metaWin.locator('button', { hasText: 'Browse Virtual OS' });
    await browseBtn.click();

    // Verify picker modal
    const picker = page.locator('.vfp-modal');
    await expect(picker).toBeVisible();

    // Navigate to Pictures folder
    await picker.locator('.vfp-sidebar-item', { hasText: 'Pictures' }).click();

    // Select evidence.jpg
    const evidenceItem = picker.locator('.vfp-item', { hasText: 'evidence.jpg' });
    await evidenceItem.click();
    await picker.locator('button.vfp-btn-open').click();
    await expect(picker).not.toBeVisible();

    // Verify metadata results table
    const metaResults = metaWin.locator('.metadata-results');
    await expect(metaResults).toBeVisible();
    await expect(metaResults.locator('.meta-row', { hasText: 'Author' })).toContainText('ARLO');
    await expect(metaResults.locator('.meta-row', { hasText: 'File Name' })).toContainText('evidence.jpg');

    // Test Inspecting device.png with Hardware ID
    await browseBtn.click();
    await expect(picker).toBeVisible();
    await picker.locator('.vfp-sidebar-item', { hasText: 'Pictures' }).click();
    await picker.locator('.vfp-item', { hasText: 'device.png' }).click();
    await picker.locator('button.vfp-btn-open').click();

    await expect(metaResults.locator('.meta-row', { hasText: 'Registered Hardware ID' })).toContainText('VX-27');

    // Close window
    await metaWin.locator('.win-ctrl-close').click();
    await expect(metaWin).not.toBeVisible();
  });

  test('05. QR Scanner - Virtual File Picker selection, decoding optical matrix & copy payload', async ({ page }) => {
    // Open QR Scanner
    const qrIcon = page.locator('.desktop-icon-cell', { hasText: 'QR Scanner' });
    await qrIcon.dblclick();

    const qrWin = page.locator('.window-frame', { hasText: 'QR Scanner' });
    await expect(qrWin).toBeVisible();

    // Click "Browse Virtual OS"
    const browseBtn = qrWin.locator('button', { hasText: 'Browse Virtual OS' });
    await browseBtn.click();

    const picker = page.locator('.vfp-modal');
    await expect(picker).toBeVisible();

    // Navigate to Pictures and select poster.png
    await picker.locator('.vfp-sidebar-item', { hasText: 'Pictures' }).click();
    await picker.locator('.vfp-item', { hasText: 'poster.png' }).click();
    await picker.locator('button.vfp-btn-open').click();

    // Verify Decoded QR Payload
    const resultPanel = qrWin.locator('.scan-result-panel');
    await expect(resultPanel).toBeVisible({ timeout: 10000 });
    await expect(resultPanel.locator('.result-value')).toHaveText('SECTOR-7');

    // Test Copy button
    const copyBtn = resultPanel.locator('button', { hasText: 'Copy Payload' });
    await copyBtn.click();
    await expect(qrWin.locator('.scanner-msg')).toContainText('Payload copied to clipboard');

    // Close window
    await qrWin.locator('.win-ctrl-close').click();
    await expect(qrWin).not.toBeVisible();
  });

  test('06. Image Inspector - Image browsing, zoom controls, image filters & metadata bridge', async ({ page }) => {
    // Open Image Inspector
    const imgIcon = page.locator('.desktop-icon-cell', { hasText: 'Image Inspector' });
    await imgIcon.dblclick();

    const imgWin = page.locator('.window-frame', { hasText: 'Image Inspector' });
    await expect(imgWin).toBeVisible();

    // Browse image from VFS
    const browseBtn = imgWin.locator('button', { hasText: 'Browse Virtual OS' });
    await browseBtn.click();

    const picker = page.locator('.vfp-modal');
    await expect(picker).toBeVisible();
    await picker.locator('.vfp-sidebar-item', { hasText: 'Pictures' }).click();
    await picker.locator('.vfp-item', { hasText: 'poster.png' }).click();
    await picker.locator('button.vfp-btn-open').click();

    // Check zoom controls
    const zoomText = imgWin.locator('.zoom-text');
    await expect(zoomText).toHaveText('100%');

    const zoomInBtn = imgWin.locator('button[title="Zoom In"]');
    await zoomInBtn.click();
    await expect(zoomText).toHaveText('125%');

    const zoomOutBtn = imgWin.locator('button[title="Zoom Out"]');
    await zoomOutBtn.click();
    await expect(zoomText).toHaveText('100%');

    // Toggle filter sliders
    const sliderToggleBtn = imgWin.locator('button[title="Adjust Brightness & Contrast"]');
    await sliderToggleBtn.click();
    await expect(imgWin.locator('.viewport-adjustments')).toBeVisible();
    await sliderToggleBtn.click();
    await expect(imgWin.locator('.viewport-adjustments')).not.toBeVisible();

    // Click "Inspect Metadata" button in header -> opens Metadata Inspector
    const inspectMetaBtn = imgWin.locator('.header-meta-btn');
    await inspectMetaBtn.click();

    const metaWin = page.locator('.window-frame', { hasText: 'Metadata Inspector - poster.png' });
    await expect(metaWin).toBeVisible();

    // Close windows
    await metaWin.locator('.win-ctrl-close').click();
    await imgWin.locator('.win-ctrl-close').click();
  });

  test('07. Text Analyzer - File selection, ranked frequency distribution & delimiter splitter', async ({ page }) => {
    // Open Text Analyzer
    const taIcon = page.locator('.desktop-icon-cell', { hasText: 'Text Analyzer' });
    await taIcon.dblclick();

    const taWin = page.locator('.window-frame', { hasText: 'Text Analyzer' });
    await expect(taWin).toBeVisible();

    // Select file from dropdown
    const fileSelect = taWin.locator('select.analyzer-select');
    await fileSelect.selectOption('/Documents/access.log');

    // Verify Frequency panel rendered
    const freqPanel = taWin.locator('.frequency-panel');
    await expect(freqPanel).toBeVisible();
    await expect(freqPanel.locator('.freq-row').first()).toBeVisible();

    // Test token copy button
    const copyTokenBtn = freqPanel.locator('.copy-token-btn').first();
    await copyTokenBtn.click();
    await expect(copyTokenBtn).toContainText('Copied');

    // Switch to Delimiter Splitter tab
    const splitterTab = taWin.locator('.tab-btn', { hasText: 'Delimiter Splitter' });
    await splitterTab.click();

    const splitterPanel = taWin.locator('.splitter-panel');
    await expect(splitterPanel).toBeVisible();

    // Enter custom delimiter
    const delimInput = splitterPanel.locator('input[type="text"]');
    await delimInput.fill('-');
    await expect(splitterPanel.locator('.parts-list')).toBeVisible();

    // Close window
    await taWin.locator('.win-ctrl-close').click();
    await expect(taWin).not.toBeVisible();
  });

  test('08. File Comparator - Side-by-side file diff, line comparison & difference isolation', async ({ page }) => {
    // Open File Comparison Tool
    const fcIcon = page.locator('.desktop-icon-cell', { hasText: 'File Comparison' });
    await fcIcon.dblclick();

    const fcWin = page.locator('.window-frame', { hasText: 'File Comparison Tool' });
    await expect(fcWin).toBeVisible();

    // Select File A
    const browseFileABtn = fcWin.locator('button', { hasText: 'Browse File A' });
    await browseFileABtn.click();
    const picker = page.locator('.vfp-modal');
    await expect(picker).toBeVisible();
    await picker.locator('.vfp-sidebar-item', { hasText: 'Documents' }).click();
    await picker.locator('.vfp-item', { hasText: 'message_old.txt' }).click();
    await picker.locator('button.vfp-btn-open').click();

    // Select File B
    const browseFileBBtn = fcWin.locator('button', { hasText: 'Browse File B' });
    await browseFileBBtn.click();
    await expect(picker).toBeVisible();
    await picker.locator('.vfp-sidebar-item', { hasText: 'Documents' }).click();
    await picker.locator('.vfp-item', { hasText: 'message_new.txt' }).click();
    await picker.locator('button.vfp-btn-open').click();

    // Diff results should calculate and render
    const diffViewer = fcWin.locator('.diff-viewer');
    await expect(diffViewer).toBeVisible();
    await expect(fcWin.locator('.diff-tag')).toContainText('9941');

    // Copy diff value
    const copyDiffBtn = fcWin.locator('button.copy-diff-btn');
    await copyDiffBtn.click();
    await expect(copyDiffBtn).toContainText('Copied');

    // Close window
    await fcWin.locator('.win-ctrl-close').click();
    await expect(fcWin).not.toBeVisible();
  });

  test('09. Audio Inspector - Waveform visualizer & acoustic signal playback', async ({ page }) => {
    // Open Audio Inspector
    const aiIcon = page.locator('.desktop-icon-cell', { hasText: 'Audio Inspector' });
    await aiIcon.dblclick();

    const aiWin = page.locator('.window-frame', { hasText: 'Audio Inspector' });
    await expect(aiWin).toBeVisible();

    // Verify audio file selected
    const audioSelect = aiWin.locator('select.audio-select');
    await expect(audioSelect).toHaveValue('/Audio/distress_beacon.wav');

    // Play audio stream
    const playBtn = aiWin.locator('button.play-btn');
    await expect(playBtn).toContainText('Playback Audio Stream');
    await playBtn.click();

    // Now button should be in playing state
    await expect(playBtn).toContainText('Pause Signal');
    await expect(aiWin.locator('.frequency-display')).toContainText('CARRIER: 142.85 MHz');

    // Pause audio
    await playBtn.click();
    await expect(playBtn).toContainText('Playback Audio Stream');

    // Close window
    await aiWin.locator('.win-ctrl-close').click();
    await expect(aiWin).not.toBeVisible();
  });

  test('10. System Settings - Hardware verification, Wi-Fi connection, power profile & chronometer sync', async ({ page }) => {
    // Open Settings
    const setIcon = page.locator('.desktop-icon-cell', { hasText: 'Settings' });
    await setIcon.dblclick();

    const setWin = page.locator('.window-frame', { hasText: 'Settings' });
    await expect(setWin).toBeVisible();

    // 1. System tab - Verify machine ID
    const verifyBtn = setWin.locator('button.settings-verify-button');
    await verifyBtn.click();
    await expect(verifyBtn).toContainText('Machine ID verified');

    // 2. Network & Wi-Fi tab
    const wifiTab = setWin.locator('button.settings-nav-item', { hasText: 'Network & Wi-Fi' });
    await wifiTab.click();
    const expNetBtn = setWin.locator('button.settings-network-row', { hasText: 'EXPEDITION-NETWORK' });
    await expNetBtn.click();
    await expect(setWin.locator('.settings-pill.connected')).toHaveText('CONNECTED');

    // 3. Power & battery tab
    const powerTab = setWin.locator('button.settings-nav-item', { hasText: 'Power & battery' });
    await powerTab.click();
    const fieldModeBtn = setWin.locator('button.settings-power-row', { hasText: 'Expedition Field Mode' });
    await fieldModeBtn.click();
    await expect(fieldModeBtn).toHaveClass(/selected/);

    // 4. Chronometer tab
    const clockTab = setWin.locator('button.settings-nav-item', { hasText: 'Chronometer' });
    await clockTab.click();
    const applyClockBtn = setWin.locator('button', { hasText: 'USE RECOVERED TIME' });
    await applyClockBtn.click();
    await expect(setWin.locator('.settings-clock-success')).toContainText('Chronometer synchronized');

    // Close window
    await setWin.locator('.win-ctrl-close').click();
    await expect(setWin).not.toBeVisible();
  });

  test('11. Terminal Interpreter - Directory traversal, file commands, grep, whoami, history & clear', async ({ page }) => {
    // Open Terminal
    const termIcon = page.locator('.desktop-icon-cell', { hasText: 'Terminal' });
    await termIcon.dblclick();

    const termWin = page.locator('.window-frame', { hasText: 'Terminal Interpreter' });
    await expect(termWin).toBeVisible();

    const termInput = termWin.locator('input.terminal-input-element');
    await expect(termInput).toBeVisible();

    // Helper command runner
    const runCmd = async (cmd) => {
      await termInput.fill(cmd);
      await termInput.press('Enter');
      await page.waitForTimeout(250);
    };

    // 1. pwd
    await runCmd('pwd');
    await expect(termWin.locator('.line-text').filter({ hasText: /^\/$/ })).toBeVisible();

    // 2. ls -a
    await runCmd('ls -a');
    await expect(termWin.locator('.terminal-entry', { hasText: 'Desktop' })).toBeVisible();

    // 3. cd Documents
    await runCmd('cd Documents');
    await runCmd('pwd');
    await expect(termWin.locator('.line-text').filter({ hasText: '/Documents' })).toBeVisible();

    // 4. grep YELLOW access.log
    await runCmd('grep YELLOW access.log');
    await expect(termWin.locator('.line-text').filter({ hasText: 'YELLOW' })).toBeVisible();

    // 5. touch notes.txt and cat notes.txt
    await runCmd('touch notes.txt');
    await runCmd('echo testcontent > notes.txt');
    await runCmd('cat notes.txt');
    await expect(termWin.locator('.line-text').filter({ hasText: 'testcontent' })).toBeVisible();

    // 6. whoami
    await runCmd('whoami');
    await expect(termWin.locator('.line-text').filter({ hasText: '@cyphora-workstation' })).toBeVisible();

    // 7. date
    await runCmd('date');
    await expect(termWin.locator('.line-text').filter({ hasText: 'GMT' })).toBeVisible();

    // 8. history
    await runCmd('history');
    await expect(termWin.locator('.line-text').filter({ hasText: 'whoami' })).toBeVisible();

    // 9. clear
    await runCmd('clear');
    await expect(termWin.locator('.line-text').filter({ hasText: 'whoami' })).not.toBeVisible();

    // Close Terminal
    await termWin.locator('.win-ctrl-close').click();
    await expect(termWin).not.toBeVisible();
  });

  test('12. Window Manager & Start Menu - Multi-window stacking, minimizing, restoring and Start Menu search', async ({ page }) => {
    // 1. Open two applications: Terminal and Text Editor
    const termIcon = page.locator('.desktop-icon-cell', { hasText: 'Terminal' });
    await termIcon.dblclick();
    const termWin = page.locator('.window-frame', { hasText: 'Terminal Interpreter' });
    await expect(termWin).toBeVisible();

    const teIcon = page.locator('.desktop-icon-cell', { hasText: 'Text Editor' });
    await teIcon.dblclick();
    const teWin = page.locator('.window-frame', { hasText: 'Text Editor' });
    await expect(teWin).toBeVisible();

    // 2. Minimize Text Editor via window title button
    const minBtn = teWin.locator('.win-ctrl-minimize');
    await minBtn.click();
    await expect(teWin).not.toBeVisible();

    // 3. Restore Text Editor via Taskbar tab
    const teTab = page.locator('.taskbar-tab', { hasText: 'Text Editor' });
    await expect(teTab).toHaveClass(/minimized-tab/);
    await teTab.click();
    await expect(teWin).toBeVisible();

    // Close both windows
    await teWin.locator('.win-ctrl-close').click();
    await termWin.locator('.win-ctrl-close').click();

    // 4. Start Menu Search Filtering
    const startBtn = page.locator('.taskbar-start-btn');
    await startBtn.click();

    const startMenu = page.locator('.os-start-menu');
    await expect(startMenu).toBeVisible();

    const searchInput = startMenu.locator('input[placeholder*="Search"]');
    await searchInput.fill('Analyzer');

    // Only Text Analyzer should match
    await expect(startMenu.locator('.start-app-item', { hasText: 'Text Analyzer' })).toBeVisible();
    await expect(startMenu.locator('.start-app-item', { hasText: 'File Manager' })).not.toBeVisible();

    // Search nonexistent query
    await searchInput.fill('NonExistentApp123');
    await expect(startMenu.locator('.start-no-results')).toBeVisible();

    // Clear search and close Start Menu
    await searchInput.fill('');
    await startBtn.click();
    await expect(startMenu).not.toBeVisible();
  });

});
