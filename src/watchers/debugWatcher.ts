import * as vscode from "vscode";
import { playFaaah } from "../player/soundPlayer";

export function registerDebugWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable {
  // Fire when a debug session terminates (crash, error, or normal end)
  // We play on every termination — if you're debugging, you're already suffering
  return vscode.debug.onDidTerminateDebugSession(() => {
    playFaaah(context);
  });
}
