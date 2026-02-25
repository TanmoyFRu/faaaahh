import * as vscode from "vscode";
import { playFaaah, playAa, killSound, setOutputChannel } from "./player/soundPlayer";
import { getConfig } from "./config";
import { registerDiagnosticWatcher } from "./watchers/diagnosticWatcher";
import { registerTaskWatcher } from "./watchers/taskWatcher";
import { registerDebugWatcher } from "./watchers/debugWatcher";

let statusBarItem: vscode.StatusBarItem;

function updateStatusBar(): void {
  const enabled = getConfig().enabled;
  statusBarItem.text = enabled ? "$(unmute) FAAAH" : "$(mute) FAAAH";
  statusBarItem.tooltip = enabled
    ? "Faaaaaahhh is ON - Click to disable"
    : "Faaaaaahhh is OFF - Click to enable";
}

export function activate(context: vscode.ExtensionContext): void {
  // Output channel for debug logs
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

  // --- Watchers ---
  context.subscriptions.push(registerDiagnosticWatcher(context));
  context.subscriptions.push(registerTaskWatcher(context));
  context.subscriptions.push(registerDebugWatcher(context));

  // Update status bar when config changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("faaaaaahhh")) {
        updateStatusBar();
      }
    })
  );

  outputChannel.appendLine("All watchers registered. Waiting for errors...");
}

export function deactivate(): void {
  killSound();
}
