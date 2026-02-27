import * as vscode from "vscode";
import { playFaaah, playAa, playVictory, killSound, setOutputChannel, isQuietHoursActive } from "./player/soundPlayer";
import { getConfig } from "./config";
import { registerDiagnosticWatcher } from "./watchers/diagnosticWatcher";
import { registerTaskWatcher } from "./watchers/taskWatcher";
import { registerDebugWatcher } from "./watchers/debugWatcher";
import { registerTerminalWatcher } from "./watchers/terminalWatcher";
import { SettingsPanel } from "./webview/settingsPanel";

let statusBarItem: vscode.StatusBarItem;

function getWorkspaceErrorCount(): number {
  let total = 0;
  for (const [, diags] of vscode.languages.getDiagnostics()) {
    total += diags.filter(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    ).length;
  }
  return total;
}

function updateStatusBar(): void {
  const config = getConfig();
  const quiet = isQuietHoursActive(config);
  const errCount = getWorkspaceErrorCount();
  const errBadge = errCount > 0 ? `  $(error)${errCount}` : "";

  if (!config.enabled) {
    statusBarItem.text = "$(mute) FAAAH";
    statusBarItem.tooltip = "Faaaaaahhh is OFF - Click to enable";
  } else if (quiet) {
    statusBarItem.text = `$(mute) FAAAH (quiet)${errBadge}`;
    statusBarItem.tooltip = `Faaaaaahhh: Quiet hours active (${config.quietHoursStart}–${config.quietHoursEnd})`;
  } else {
    statusBarItem.text = `$(unmute) FAAAH${errBadge}`;
    statusBarItem.tooltip = "Faaaaaahhh is ON - Click to disable";
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const outputChannel = vscode.window.createOutputChannel("Faaaaaahhh");
  setOutputChannel(outputChannel);
  outputChannel.appendLine("Faaaaaahhh activated! Let the suffering begin.");

  // --- Status Bar ---
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "faaaaaahhh.toggle";
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Refresh status bar every 60s to reflect quiet hours changes
  const quietRefresh = setInterval(() => updateStatusBar(), 60_000);
  context.subscriptions.push({ dispose: () => clearInterval(quietRefresh) });

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.toggle", async () => {
      const config = vscode.workspace.getConfiguration("faaaaaahhh");
      const current = config.get<boolean>("enabled", true);
      await config.update("enabled", !current, vscode.ConfigurationTarget.Global);
      updateStatusBar();
      vscode.window.showInformationMessage(
        !current ? "FAAAH is ON! Errors will be punished." : "FAAAH is OFF. You're safe... for now."
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.testSound", () => {
      outputChannel.appendLine("Test error sound triggered!");
      playFaaah(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.testWarningSound", () => {
      outputChannel.appendLine("Test warning sound triggered!");
      playAa(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.testVictorySound", () => {
      outputChannel.appendLine("Test victory sound triggered!");
      playVictory(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.openSettings", () => {
      SettingsPanel.createOrShow(context);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("faaaaaahhh.switchSoundPack", async () => {
      const current = getConfig().soundPack;
      const picked = await vscode.window.showQuickPick(
        [
          {
            label: "Meme Pack",
            description: `The classic FAAAH experience${current === "meme" ? "  (active)" : ""}`,
            value: "meme",
          },
          {
            label: "Rage Pack",
            description: `Louder. Angrier.${current === "rage" ? "  (active)" : ""}`,
            value: "rage",
          },
          {
            label: "Chill Pack",
            description: `Subtle suffering${current === "chill" ? "  (active)" : ""}`,
            value: "chill",
          },
        ],
        { placeHolder: "Choose a sound pack" }
      );
      if (picked) {
        await vscode.workspace.getConfiguration("faaaaaahhh")
          .update("soundPack", picked.value, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Sound pack switched to: ${picked.label}`);
      }
    })
  );

  // --- Watchers ---
  context.subscriptions.push(registerDiagnosticWatcher(context));
  context.subscriptions.push(registerTaskWatcher(context));
  context.subscriptions.push(registerDebugWatcher(context));
  context.subscriptions.push(...registerTerminalWatcher(context));

  // Update status bar when config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("faaaaaahhh")) {
        updateStatusBar();
      }
    })
  );

  // Update error count in status bar whenever diagnostics change
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics(() => updateStatusBar())
  );

  outputChannel.appendLine("All watchers registered. Waiting for errors...");
}

export function deactivate(): void {
  killSound();
}
