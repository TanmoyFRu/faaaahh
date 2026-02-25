import * as vscode from "vscode";
import { playFaaah, playAa } from "../player/soundPlayer";

// Track counts per URI so we only trigger on NEW errors/warnings
const previousErrorCounts = new Map<string, number>();
const previousWarningCounts = new Map<string, number>();

export function registerDiagnosticWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.languages.onDidChangeDiagnostics((event) => {
    for (const uri of event.uris) {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const key = uri.toString();

      // --- Errors → FAAAH ---
      const errorCount = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Error
      ).length;
      const prevErrors = previousErrorCounts.get(key) ?? 0;

      if (errorCount > prevErrors) {
        playFaaah(context);
      }

      if (errorCount === 0) {
        previousErrorCounts.delete(key);
      } else {
        previousErrorCounts.set(key, errorCount);
      }

      // --- Warnings → AA ---
      const warningCount = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Warning
      ).length;
      const prevWarnings = previousWarningCounts.get(key) ?? 0;

      if (warningCount > prevWarnings) {
        playAa(context);
      }

      if (warningCount === 0) {
        previousWarningCounts.delete(key);
      } else {
        previousWarningCounts.set(key, warningCount);
      }
    }
  });
}
