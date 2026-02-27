import * as vscode from "vscode";

export class SettingsPanel {
  public static currentPanel: SettingsPanel | undefined;

  private readonly _panel: vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(context: vscode.ExtensionContext): void {
    if (SettingsPanel.currentPanel) {
      SettingsPanel.currentPanel._panel.reveal();
      return;
    }
    const panel = vscode.window.createWebviewPanel(
      "faaaaaahhh.settings",
      "Faaaaaahhh Settings",
      vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true }
    );
    SettingsPanel.currentPanel = new SettingsPanel(panel, context);
  }

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel = panel;
    this._context = context;
    this._panel.webview.html = this._getHtml();

    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        const cfg = vscode.workspace.getConfiguration("faaaaaahhh");
        switch (message.command) {
          case "updateEnabled":
            await cfg.update("enabled", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateCooldown":
            await cfg.update("cooldownMs", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateWarningsEnabled":
            await cfg.update("warningsEnabled", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateVictoryEnabled":
            await cfg.update("victoryEnabled", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateTerminalEnabled":
            await cfg.update("terminalSoundEnabled", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateVolume":
            await cfg.update("volume", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateStreakThreshold":
            await cfg.update("streakThresholdToast", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateQuietHours":
            await cfg.update("quietHoursStart", message.start, vscode.ConfigurationTarget.Global);
            await cfg.update("quietHoursEnd", message.end, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
              message.start && message.end
                ? `Quiet hours set: ${message.start} – ${message.end}`
                : "Quiet hours disabled."
            );
            break;
          // ── Custom sound paths ────────────────────────────────────────────────
          case "updateCustomSoundFolder":
            await cfg.update("customSoundFolder", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateCustomWarningSoundFolder":
            await cfg.update("customWarningSoundFolder", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateErrorTier": {
            const current = cfg.get<{ tier1: string; tier2: string; tier3: string }>(
              "errorTierSounds", { tier1: "", tier2: "", tier3: "" }
            );
            const updated = { ...current, [message.tier]: message.value };
            await cfg.update("errorTierSounds", updated, vscode.ConfigurationTarget.Global);
            break;
          }
          case "updateWarningTier": {
            const current = cfg.get<{ tier1: string; tier2: string }>(
              "warningTierSounds", { tier1: "", tier2: "" }
            );
            const updated = { ...current, [message.tier]: message.value };
            await cfg.update("warningTierSounds", updated, vscode.ConfigurationTarget.Global);
            break;
          }
          case "updateVictoryPath":
            await cfg.update("customVictoryPath", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateTerminalPath":
            await cfg.update("customTerminalSoundPath", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateCustomSoundPath":
            await cfg.update("customSoundPath", message.value, vscode.ConfigurationTarget.Global);
            break;
          case "updateCustomWarningSoundPath":
            await cfg.update("customWarningSoundPath", message.value, vscode.ConfigurationTarget.Global);
            break;
        }
      },
      undefined,
      this._disposables
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _getHtml(): string {
    const cfg = vscode.workspace.getConfiguration("faaaaaahhh");
    const volume = Math.min(100, Math.max(0, cfg.get<number>("volume", 100)));
    const cooldown = cfg.get<number>("cooldownMs", 0);
    const enabled = cfg.get<boolean>("enabled", true);
    const warningsEnabled = cfg.get<boolean>("warningsEnabled", true);
    const victoryEnabled = cfg.get<boolean>("victoryEnabled", true);
    const terminalEnabled = cfg.get<boolean>("terminalSoundEnabled", true);
    const streakThreshold = cfg.get<number>("streakThresholdToast", 10);
    const quietStart = cfg.get<string>("quietHoursStart", "");
    const quietEnd = cfg.get<string>("quietHoursEnd", "");
    const soundPack = cfg.get<string>("soundPack", "meme");
    const errorTiers = cfg.get<{ tier1: string; tier2: string; tier3: string }>(
      "errorTierSounds", { tier1: "", tier2: "", tier3: "" }
    );
    const warningTiers = cfg.get<{ tier1: string; tier2: string }>(
      "warningTierSounds", { tier1: "", tier2: "" }
    );
    const customSoundFolder = cfg.get<string>("customSoundFolder", "");
    const customWarningSoundFolder = cfg.get<string>("customWarningSoundFolder", "");
    const customVictoryPath = cfg.get<string>("customVictoryPath", "");
    const customTerminalPath = cfg.get<string>("customTerminalSoundPath", "");

    const e = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Faaaaaahhh Settings</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: var(--vscode-font-family);
    color: var(--vscode-foreground);
    background: var(--vscode-editor-background);
    padding: 24px 32px;
    max-width: 680px;
  }
  h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
  }
  .subtitle {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin: 0 0 28px 0;
  }
  .section {
    margin-bottom: 28px;
  }
  .section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--vscode-descriptionForeground);
    margin: 0 0 12px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--vscode-widget-border, #333);
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .row label {
    flex: 1;
    font-size: 13px;
    min-width: 180px;
  }
  .row .desc {
    display: block;
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin-top: 2px;
  }
  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    flex-shrink: 0;
    accent-color: var(--vscode-focusBorder, #007acc);
  }
  input[type="range"] {
    width: 200px;
    flex-shrink: 0;
    accent-color: var(--vscode-focusBorder, #007acc);
  }
  .range-val {
    font-size: 12px;
    color: var(--vscode-foreground);
    min-width: 55px;
    font-variant-numeric: tabular-nums;
  }
  input[type="number"] {
    width: 80px;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, #555);
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 13px;
  }
  input[type="time"] {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, #555);
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 13px;
  }
  input[type="text"] {
    flex: 1;
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border, #555);
    padding: 5px 8px;
    border-radius: 2px;
    font-size: 12px;
    font-family: var(--vscode-editor-font-family, monospace);
    min-width: 0;
  }
  input[type="text"]::placeholder {
    color: var(--vscode-input-placeholderForeground);
    font-style: italic;
  }
  .quiet-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 13px;
  }
  button {
    padding: 5px 12px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
    flex-shrink: 0;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary {
    background: var(--vscode-button-secondaryBackground, #3a3d41);
    color: var(--vscode-button-secondaryForeground, #ccc);
  }
  button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground, #45494e); }
  .pack-info {
    font-size: 12px;
    color: var(--vscode-descriptionForeground);
    font-style: italic;
  }
  .tip {
    margin-top: 20px;
    padding: 10px 14px;
    background: var(--vscode-textBlockQuote-background, rgba(127,127,127,0.1));
    border-left: 3px solid var(--vscode-focusBorder, #007acc);
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    border-radius: 0 2px 2px 0;
    line-height: 1.6;
  }
  .sound-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }
  .sound-row .sound-label {
    font-size: 12px;
    min-width: 190px;
    flex-shrink: 0;
  }
  .sound-label .badge {
    display: inline-block;
    font-size: 10px;
    padding: 1px 5px;
    border-radius: 3px;
    margin-left: 4px;
    background: var(--vscode-badge-background, #4d4d4d);
    color: var(--vscode-badge-foreground, #fff);
    vertical-align: middle;
  }
  .saved-flash {
    font-size: 11px;
    color: #4caf50;
    margin-left: 4px;
    opacity: 0;
    transition: opacity 0.3s;
  }
</style>
</head>
<body>
<h1>Faaaaaahhh Settings</h1>
<p class="subtitle">v0.1.0 — All changes apply immediately (except paths, which save on click).</p>

<!-- ── General ── -->
<div class="section">
  <div class="section-title">General</div>
  <div class="row">
    <label>
      Sounds Enabled
      <span class="desc">Master switch for all sounds.</span>
    </label>
    <input type="checkbox" id="enabled" ${enabled ? "checked" : ""}>
  </div>
  <div class="row">
    <label>
      Warning Sounds (AA)
      <span class="desc">Play AA sound on new warnings.</span>
    </label>
    <input type="checkbox" id="warningsEnabled" ${warningsEnabled ? "checked" : ""}>
  </div>
  <div class="row">
    <label>
      Victory Sound
      <span class="desc">Play when all errors in a file are fixed.</span>
    </label>
    <input type="checkbox" id="victoryEnabled" ${victoryEnabled ? "checked" : ""}>
  </div>
  <div class="row">
    <label>
      Terminal Mistype Sound
      <span class="desc">Play when a terminal command fails or isn't recognized.</span>
    </label>
    <input type="checkbox" id="terminalEnabled" ${terminalEnabled ? "checked" : ""}>
  </div>
  <div class="row">
    <label>
      Volume
      <span class="desc">Playback volume for all sounds.</span>
    </label>
    <input type="range" id="volume" min="0" max="100" step="5" value="${volume}">
    <span class="range-val" id="volumeVal">${volume}%</span>
  </div>
</div>

<!-- ── Cooldown ── -->
<div class="section">
  <div class="section-title">Cooldown</div>
  <div class="row">
    <label>
      Between sounds
      <span class="desc">Minimum time (per kind) before the next sound plays.</span>
    </label>
    <input type="range" id="cooldown" min="0" max="10000" step="100" value="${cooldown}">
    <span class="range-val" id="cooldownVal">${cooldown === 0 ? "Off" : cooldown + "ms"}</span>
  </div>
</div>

<!-- ── Error Streak ── -->
<div class="section">
  <div class="section-title">Error Streak</div>
  <div class="row">
    <label>
      Shame notification threshold
      <span class="desc">Show a toast after this many consecutive errors with no fixes.</span>
    </label>
    <input type="number" id="streakThreshold" value="${streakThreshold}" min="1" max="100">
  </div>
</div>

<!-- ── Quiet Hours ── -->
<div class="section">
  <div class="section-title">Quiet Hours</div>
  <div class="quiet-row">
    <span>From</span>
    <input type="time" id="quietStart" value="${e(quietStart)}">
    <span>to</span>
    <input type="time" id="quietEnd" value="${e(quietEnd)}">
    <button id="saveQuiet">Save</button>
    <button id="clearQuiet" class="secondary">Clear</button>
  </div>
  <div style="font-size:11px;color:var(--vscode-descriptionForeground)">
    Sounds are muted during this window. Status bar shows "(quiet)". Leave empty to disable.
  </div>
</div>

<!-- ── Custom Error Sounds ── -->
<div class="section">
  <div class="section-title">Custom Error Sounds</div>

  <div class="sound-row">
    <span class="sound-label">
      Random folder
      <span class="badge">overrides tiers</span>
    </span>
    <input type="text" id="errorFolder" value="${e(customSoundFolder)}"
      placeholder="C:\\sounds\\errors (picks random .wav)">
    <button onclick="savePath('errorFolder', 'updateCustomSoundFolder')">Save</button>
    <button class="secondary" onclick="clearPath('errorFolder', 'updateCustomSoundFolder')">✕</button>
    <span class="saved-flash" id="errorFolder-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">
      Syntax errors
      <span class="badge">tier 1</span>
    </span>
    <input type="text" id="errorTier1" value="${e(errorTiers.tier1)}"
      placeholder="C:\\sounds\\faaah-easy.wav">
    <button onclick="saveErrorTier('errorTier1', 'tier1')">Save</button>
    <button class="secondary" onclick="clearErrorTier('errorTier1', 'tier1')">✕</button>
    <span class="saved-flash" id="errorTier1-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">
      Medium errors (2–4 new)
      <span class="badge">tier 2</span>
    </span>
    <input type="text" id="errorTier2" value="${e(errorTiers.tier2)}"
      placeholder="C:\\sounds\\faah-mid.wav">
    <button onclick="saveErrorTier('errorTier2', 'tier2')">Save</button>
    <button class="secondary" onclick="clearErrorTier('errorTier2', 'tier2')">✕</button>
    <span class="saved-flash" id="errorTier2-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">
      High errors (5+ new)
      <span class="badge">tier 3</span>
    </span>
    <input type="text" id="errorTier3" value="${e(errorTiers.tier3)}"
      placeholder="C:\\sounds\\faah-high.wav">
    <button onclick="saveErrorTier('errorTier3', 'tier3')">Save</button>
    <button class="secondary" onclick="clearErrorTier('errorTier3', 'tier3')">✕</button>
    <span class="saved-flash" id="errorTier3-flash">✓</span>
  </div>
</div>

<!-- ── Custom Warning Sounds ── -->
<div class="section">
  <div class="section-title">Custom Warning Sounds</div>

  <div class="sound-row">
    <span class="sound-label">
      Random folder
      <span class="badge">overrides tiers</span>
    </span>
    <input type="text" id="warningFolder" value="${e(customWarningSoundFolder)}"
      placeholder="C:\\sounds\\warnings">
    <button onclick="savePath('warningFolder', 'updateCustomWarningSoundFolder')">Save</button>
    <button class="secondary" onclick="clearPath('warningFolder', 'updateCustomWarningSoundFolder')">✕</button>
    <span class="saved-flash" id="warningFolder-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">
      Minor warnings (1 new)
      <span class="badge">tier 1</span>
    </span>
    <input type="text" id="warnTier1" value="${e(warningTiers.tier1)}"
      placeholder="C:\\sounds\\aa-low.wav">
    <button onclick="saveWarningTier('warnTier1', 'tier1')">Save</button>
    <button class="secondary" onclick="clearWarningTier('warnTier1', 'tier1')">✕</button>
    <span class="saved-flash" id="warnTier1-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">
      Major warnings (2+ new)
      <span class="badge">tier 2</span>
    </span>
    <input type="text" id="warnTier2" value="${e(warningTiers.tier2)}"
      placeholder="C:\\sounds\\aa-high.wav">
    <button onclick="saveWarningTier('warnTier2', 'tier2')">Save</button>
    <button class="secondary" onclick="clearWarningTier('warnTier2', 'tier2')">✕</button>
    <span class="saved-flash" id="warnTier2-flash">✓</span>
  </div>
</div>

<!-- ── Other Sounds ── -->
<div class="section">
  <div class="section-title">Other Sounds</div>

  <div class="sound-row">
    <span class="sound-label">Victory sound</span>
    <input type="text" id="victoryPath" value="${e(customVictoryPath)}"
      placeholder="C:\\sounds\\victory.wav">
    <button onclick="savePath('victoryPath', 'updateVictoryPath')">Save</button>
    <button class="secondary" onclick="clearPath('victoryPath', 'updateVictoryPath')">✕</button>
    <span class="saved-flash" id="victoryPath-flash">✓</span>
  </div>

  <div class="sound-row">
    <span class="sound-label">Terminal mistype sound</span>
    <input type="text" id="terminalPath" value="${e(customTerminalPath)}"
      placeholder="C:\\sounds\\ahhhh.wav">
    <button onclick="savePath('terminalPath', 'updateTerminalPath')">Save</button>
    <button class="secondary" onclick="clearPath('terminalPath', 'updateTerminalPath')">✕</button>
    <span class="saved-flash" id="terminalPath-flash">✓</span>
  </div>
</div>

<!-- ── Sound Pack ── -->
<div class="section">
  <div class="section-title">Sound Pack</div>
  <div style="font-size:13px;margin-bottom:8px">
    Active pack: <strong>${e(soundPack)}</strong>
  </div>
  <p class="pack-info">
    Switch packs via Command Palette → "Faaaaaahhh: Switch Sound Pack".<br>
    Custom paths above always override the active sound pack.
  </p>
</div>

<div class="tip">
  <strong>Priority (highest → lowest):</strong><br>
  Random folder → Custom tier path → Sound pack file → Built-in fallback<br><br>
  <strong>Tier system:</strong> 1 new error = tier 1 (syntax/low), 2–4 = tier 2 (mid), 5+ = tier 3 (high).<br>
  Syntax errors (typos, missing brackets) always play tier 1 regardless of count.
</div>

<script>
  const vscode = acquireVsCodeApi();

  function flash(id) {
    const el = document.getElementById(id + '-flash');
    if (!el) return;
    el.style.opacity = '1';
    setTimeout(() => { el.style.opacity = '0'; }, 1400);
  }

  function savePath(inputId, command) {
    const val = document.getElementById(inputId).value.trim();
    vscode.postMessage({ command, value: val });
    flash(inputId);
  }

  function clearPath(inputId, command) {
    document.getElementById(inputId).value = '';
    vscode.postMessage({ command, value: '' });
    flash(inputId);
  }

  function saveErrorTier(inputId, tier) {
    const val = document.getElementById(inputId).value.trim();
    vscode.postMessage({ command: 'updateErrorTier', tier, value: val });
    flash(inputId);
  }

  function clearErrorTier(inputId, tier) {
    document.getElementById(inputId).value = '';
    vscode.postMessage({ command: 'updateErrorTier', tier, value: '' });
    flash(inputId);
  }

  function saveWarningTier(inputId, tier) {
    const val = document.getElementById(inputId).value.trim();
    vscode.postMessage({ command: 'updateWarningTier', tier, value: val });
    flash(inputId);
  }

  function clearWarningTier(inputId, tier) {
    document.getElementById(inputId).value = '';
    vscode.postMessage({ command: 'updateWarningTier', tier, value: '' });
    flash(inputId);
  }

  // Enabled
  document.getElementById('enabled').addEventListener('change', (e) => {
    vscode.postMessage({ command: 'updateEnabled', value: e.target.checked });
  });

  // Warnings enabled
  document.getElementById('warningsEnabled').addEventListener('change', (e) => {
    vscode.postMessage({ command: 'updateWarningsEnabled', value: e.target.checked });
  });

  // Victory enabled
  document.getElementById('victoryEnabled').addEventListener('change', (e) => {
    vscode.postMessage({ command: 'updateVictoryEnabled', value: e.target.checked });
  });

  // Terminal enabled
  document.getElementById('terminalEnabled').addEventListener('change', (e) => {
    vscode.postMessage({ command: 'updateTerminalEnabled', value: e.target.checked });
  });

  // Volume slider
  const volSlider = document.getElementById('volume');
  const volVal = document.getElementById('volumeVal');
  volSlider.addEventListener('input', () => {
    const v = parseInt(volSlider.value);
    volVal.textContent = v + '%';
    vscode.postMessage({ command: 'updateVolume', value: v });
  });

  // Cooldown slider
  const slider = document.getElementById('cooldown');
  const valSpan = document.getElementById('cooldownVal');
  slider.addEventListener('input', () => {
    const v = parseInt(slider.value);
    valSpan.textContent = v === 0 ? 'Off' : v + 'ms';
    vscode.postMessage({ command: 'updateCooldown', value: v });
  });

  // Streak threshold
  document.getElementById('streakThreshold').addEventListener('change', (e) => {
    const v = parseInt(e.target.value);
    if (!isNaN(v) && v >= 1) {
      vscode.postMessage({ command: 'updateStreakThreshold', value: v });
    }
  });

  // Quiet hours save
  document.getElementById('saveQuiet').addEventListener('click', () => {
    vscode.postMessage({
      command: 'updateQuietHours',
      start: document.getElementById('quietStart').value,
      end: document.getElementById('quietEnd').value,
    });
  });

  // Quiet hours clear
  document.getElementById('clearQuiet').addEventListener('click', () => {
    document.getElementById('quietStart').value = '';
    document.getElementById('quietEnd').value = '';
    vscode.postMessage({ command: 'updateQuietHours', start: '', end: '' });
  });
</script>
</body>
</html>`;
  }

  public dispose(): void {
    SettingsPanel.currentPanel = undefined;
    this._panel.dispose();
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
}
