import * as vscode from "vscode";
import { playAhhhh } from "../player/soundPlayer";
import { getConfig } from "../config";

export function registerTerminalWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable[] {
  const disposables: vscode.Disposable[] = [];

  // Shell integration API (VS Code 1.93+) — fires after each terminal command finishes
  // Exit code 127 = command not found (bash/zsh mistype)
  // Exit code != 0 = any terminal error/mistype
  if (typeof (vscode.window as any).onDidEndTerminalShellExecution === "function") {
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
  }

  // Fallback for older VS Code: watch terminal data for "command not found" patterns
  // onDidWriteTerminalData is available in VS Code 1.56+ as a stable API
  if (typeof (vscode.window as any).onDidWriteTerminalData === "function") {
    disposables.push(
      (vscode.window as any).onDidWriteTerminalData(
        (event: { data: string }) => {
          if (!getConfig().terminalSoundEnabled) { return; }
          const data = event.data.toLowerCase();
          if (
            data.includes("command not found") ||
            data.includes("is not recognized") ||
            data.includes("cannot be loaded because running scripts") ||
            data.includes("no such file or directory") ||
            data.includes("not found")
          ) {
            playAhhhh(context);
          }
        }
      )
    );
  }

  return disposables;
}
