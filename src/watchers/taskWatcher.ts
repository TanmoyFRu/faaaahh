import * as vscode from "vscode";
import { playFaaah } from "../player/soundPlayer";

export function registerTaskWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.tasks.onDidEndTaskProcess((event) => {
    if (event.exitCode !== undefined && event.exitCode !== 0) {
      // Task failed with non-zero exit code — FAAAH!
      playFaaah(context);
    }
  });
}
