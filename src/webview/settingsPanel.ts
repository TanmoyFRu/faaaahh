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
        }
      },
      undefined,
      this._disposables
    );

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private _getHtml(): string {
    const cfg = vscode.workspace.getConfiguration("faaaaaahhh");
    const cooldown = cfg.get<number>("cooldownMs", 0);
    const enabled = cfg.get<boolean>("enabled", true);
    const warningsEnabled = cfg.get<boolean>("warningsEnabled", true);
    const victoryEnabled = cfg.get<boolean>("victoryEnabled", true);
    const streakThreshold = cfg.get<number>("streakThresholdToast", 10);
    const quietStart = cfg.get<string>("quietHoursStart", "");
    const quietEnd = cfg.get<string>("quietHoursEnd", "");
    const soundPack = cfg.get<string>("soundPack", "meme");

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
    max-width: 600px;
  }
  h1 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: var(--vscode-foreground);
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
  .quiet-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 13px;
  }
  button {
    padding: 6px 14px;
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
    font-family: inherit;
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
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
  }
</style>
</head>
<body>
<h1>Faaaaaahhh Settings</h1>
<p class="subtitle">v0.1.0 — All changes apply immediately.</p>

<!-- Master switches -->
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
</div>

<!-- Cooldown -->
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

<!-- Streak -->
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

<!-- Quiet Hours -->
<div class="section">
  <div class="section-title">Quiet Hours</div>
  <div class="quiet-row">
    <span>From</span>
    <input type="time" id="quietStart" value="${quietStart}">
    <span>to</span>
    <input type="time" id="quietEnd" value="${quietEnd}">
    <button id="saveQuiet">Save</button>
    <button id="clearQuiet">Clear</button>
  </div>
  <div style="font-size:11px;color:var(--vscode-descriptionForeground)">
    Sounds are muted during this window. Status bar shows "(quiet)".
    Leave empty to disable.
  </div>
</div>

<!-- Sound Pack -->
<div class="section">
  <div class="section-title">Sound Pack</div>
  <div style="font-size:13px;margin-bottom:8px">
    Active pack: <strong>${soundPack}</strong>
  </div>
  <p class="pack-info">
    Switch packs via Command Palette → "Faaaaaahhh: Switch Sound Pack".<br>
    Drop custom WAV files into a folder and set customSoundFolder in VS Code settings
    to override the pack entirely.
  </p>
</div>

<div class="tip">
  Tier system: 1 new error = tier1 (low), 2–4 = tier2 (mid), 5+ = tier3 (high).<br>
  Override individual tiers with custom WAV paths in <code>faaaaaahhh.errorTierSounds</code>.
</div>

<script>
  const vscode = acquireVsCodeApi();

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
