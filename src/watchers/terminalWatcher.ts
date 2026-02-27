import * as vscode from "vscode";
import { playAhhhh } from "../player/soundPlayer";
import { getConfig } from "../config";

export function registerTerminalWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  const hasShellIntegration =
    typeof (vscode.window as any).onDidEndTerminalShellExecution === "function";

  if (hasShellIntegration) {
    // Shell integration API (VS Code 1.93+) — fires after each terminal command finishes.
    // Exit code 127 = command not found; any non-zero exit = failure.
    disposables.push(
      (vscode.window as any).onDidEndTerminalShellExecution(
        (event: { exitCode: number | undefined }) => {
          if (!getConfig().terminalSoundEnabled) { return; }
          if (event.exitCode !== undefined && event.exitCode !== 0) {
            playAhhhh(context);
          }
        }
      )
    );
  } else if (typeof (vscode.window as any).onDidWriteTerminalData === "function") {
    // Fallback for VS Code < 1.93: pattern-match terminal output.
    // Only registers when shell integration is unavailable to prevent double-firing.
    disposables.push(
      (vscode.window as any).onDidWriteTerminalData(
        (event: { data: string }) => {
          if (!getConfig().terminalSoundEnabled) { return; }
          const data = event.data.toLowerCase();
          if (
            data.includes("command not found") ||
            data.includes("is not recognized as an internal or external command") ||
            data.includes("cannot be loaded because running scripts is disabled")
          ) {
            playAhhhh(context);
          }
        }
      )
    );
  }

  return disposables;
}
