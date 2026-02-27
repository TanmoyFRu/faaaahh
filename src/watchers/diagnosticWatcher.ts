import * as vscode from "vscode";
import { playSound, playVictory } from "../player/soundPlayer";
import { getConfig } from "../config";

const previousErrorCounts = new Map<string, number>();
const previousWarningCounts = new Map<string, number>();

// Streak tracking: consecutive error events without any fix
let currentStreak = 0;
const toastFiredAt = new Set<number>();

/**
 * Returns true if a diagnostic looks like a syntax error rather than a
 * semantic/type error. Syntax errors deserve the gentle faah-low sound.
 *
 * Detection covers:
 * - TypeScript compiler syntax error codes (1000–1999)
 * - Common message patterns across languages
 */
function isSyntaxError(d: vscode.Diagnostic): boolean {
  // TypeScript: syntax errors are in the 1000–1999 code range
  if (typeof d.code === "number" && d.code >= 1000 && d.code <= 1999) {
    return true;
  }
  // Some sources wrap codes as objects: { value: number, target: Uri }
  if (d.code && typeof (d.code as any).value === "number") {
    const v = (d.code as any).value as number;
    if (v >= 1000 && v <= 1999) { return true; }
  }
  // Language-agnostic message patterns
  const msg = d.message.toLowerCase();
  return (
    msg.includes("expected") ||
    msg.includes("unexpected token") ||
    msg.includes("unexpected end") ||
    msg.includes("unterminated") ||
    msg.includes("syntax error") ||
    msg.includes("invalid syntax") ||
    msg.includes("missing semicolon") ||
    msg.includes("cannot find name") === false && msg.includes("not found") === false &&
    msg.includes("expected")
  );
}

export function registerDiagnosticWatcher(
  context: vscode.ExtensionContext
): vscode.Disposable {
  return vscode.languages.onDidChangeDiagnostics((event) => {
    const config = getConfig();
    let maxNewErrors = 0;
    let maxNewWarnings = 0;
    let anyFix = false;
    let newErrorsAreSyntax = true; // tracks whether all new errors this batch are syntax errors

    for (const uri of event.uris) {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const key = uri.toString();

      // ── Errors ──────────────────────────────────────────────────────────────
      const errors = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Error
      );
      const errorCount = errors.length;
      const prevErrors = previousErrorCounts.get(key) ?? 0;

      if (errorCount > prevErrors) {
        const delta = errorCount - prevErrors;
        maxNewErrors = Math.max(maxNewErrors, delta);

        // Check if new errors are syntax errors
        // Compare to previous count: look at errors beyond prevErrors index
        const newErrors = errors.slice(prevErrors);
        if (newErrors.some((d) => !isSyntaxError(d))) {
          newErrorsAreSyntax = false;
        }
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

      if (newErrorsAreSyntax) {
        // Syntax errors → always tier1 (faah-low) — it's just a typo, chill
        playSound(context, "error", 1);
      } else {
        // Semantic/type errors → tier based on how many arrived at once
        playSound(context, "error", maxNewErrors);
      }

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
