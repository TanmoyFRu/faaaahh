import * as vscode from "vscode";
import { playSound, playVictory } from "../player/soundPlayer";
import { getConfig } from "../config";

const previousErrorCounts = new Map<string, number>();
const previousWarningCounts = new Map<string, number>();

// Streak tracking: consecutive error events without any fix
let currentStreak = 0;
const toastFiredAt = new Set<number>();

export function registerDiagnosticWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.languages.onDidChangeDiagnostics((event) => {
    const config = getConfig();
    let maxNewErrors = 0;
    let maxNewWarnings = 0;
    let anyFix = false;

    for (const uri of event.uris) {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const key = uri.toString();

      // ── Errors ──────────────────────────────────────────────────────────────
      const errorCount = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Error
      ).length;
      const prevErrors = previousErrorCounts.get(key) ?? 0;

      if (errorCount > prevErrors) {
        maxNewErrors = Math.max(maxNewErrors, errorCount - prevErrors);
      }

      // Victory: errors cleared completely for this file
      if (prevErrors > 0 && errorCount === 0 && config.victoryEnabled) {
        playVictory(context);
      }

      // Any reduction in errors counts as a fix (resets streak)
      if (errorCount < prevErrors) {
        anyFix = true;
      }

      if (errorCount === 0) {
        previousErrorCounts.delete(key);
      } else {
        previousErrorCounts.set(key, errorCount);
      }

      // ── Warnings ─────────────────────────────────────────────────────────────
      const warningCount = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Warning
      ).length;
      const prevWarnings = previousWarningCounts.get(key) ?? 0;

      if (warningCount > prevWarnings) {
        maxNewWarnings = Math.max(maxNewWarnings, warningCount - prevWarnings);
      }

      if (warningCount === 0) {
        previousWarningCounts.delete(key);
      } else {
        previousWarningCounts.set(key, warningCount);
      }
    }

    // ── Fire sounds once per event batch ──────────────────────────────────────
    if (maxNewErrors > 0) {
      currentStreak++;
      playSound(context, "error", maxNewErrors);
      checkStreak(config.streakThresholdToast);
    }

    if (maxNewWarnings > 0) {
      playSound(context, "warning", maxNewWarnings);
    }

    if (anyFix) {
      currentStreak = 0;
      toastFiredAt.clear();
    }
  });
}

function checkStreak(threshold: number): void {
  if (currentStreak >= threshold && !toastFiredAt.has(threshold)) {
    toastFiredAt.add(threshold);
    vscode.window.showWarningMessage(
      `${currentStreak} errors and counting. Are you okay?`
    );
  }
}
