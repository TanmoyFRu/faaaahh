import { execFile, ChildProcess } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import * as vscode from "vscode";
import { getConfig, FaaaaahhhConfig } from "../config";

let outputChannel: vscode.OutputChannel | null = null;
const activeProcesses: Set<ChildProcess> = new Set();
const lastPlayedAt = new Map<string, number>();

export function setOutputChannel(channel: vscode.OutputChannel): void {
  outputChannel = channel;
}

function log(msg: string): void {
  outputChannel?.appendLine(`[SoundPlayer] ${msg}`);
}

// ── Quiet Hours ────────────────────────────────────────────────────────────────

export function isQuietHoursActive(config: FaaaaahhhConfig): boolean {
  const start = config.quietHoursStart.trim();
  const end = config.quietHoursEnd.trim();
  if (!start || !end) { return false; }

  const now = new Date();
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) { return false; }

  const nowMins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  // Handle overnight ranges (e.g. 22:00 to 06:00)
  if (startMins <= endMins) {
    return nowMins >= startMins && nowMins < endMins;
  } else {
    return nowMins >= startMins || nowMins < endMins;
  }
}

// ── Cooldown ───────────────────────────────────────────────────────────────────

function isCoolingDown(kind: string, cooldownMs: number): boolean {
  if (cooldownMs <= 0) { return false; }
  const last = lastPlayedAt.get(kind) ?? 0;
  return Date.now() - last < cooldownMs;
}

function recordPlayed(kind: string): void {
  lastPlayedAt.set(kind, Date.now());
}

// ── Random folder picker ───────────────────────────────────────────────────────

function pickRandomFromFolder(folderPath: string): string | null {
  try {
    const files = fs.readdirSync(folderPath).filter(
      (f) => f.toLowerCase().endsWith(".wav")
    );
    if (files.length === 0) { return null; }
    const chosen = files[Math.floor(Math.random() * files.length)];
    return path.join(folderPath, chosen);
  } catch {
    return null;
  }
}

// ── Sound pack / bundled file resolution ──────────────────────────────────────

function getBundledSoundPath(
  context: vscode.ExtensionContext,
  pack: string,
  filename: string
): string {
  const packPath = path.join(context.extensionPath, "media", pack, filename);
  if (fs.existsSync(packPath)) { return packPath; }
  return path.join(context.extensionPath, "media", filename);
}

// ── Per-kind sound resolvers ───────────────────────────────────────────────────

function resolveErrorSound(
  context: vscode.ExtensionContext,
  config: FaaaaahhhConfig,
  delta: number
): string {
  // 1. Random folder takes highest priority
  if (config.customSoundFolder.trim()) {
    const picked = pickRandomFromFolder(config.customSoundFolder.trim());
    if (picked) { return picked; }
  }

  // 2. Legacy single-file override (backward compat)
  if (config.customSoundPath.trim()) {
    return config.customSoundPath.trim();
  }

  // 3. Tier system: tier1=1, tier2=2-4, tier3=5+
  const tierKey = delta >= 5 ? "tier3" : delta >= 2 ? "tier2" : "tier1";
  const userTierPath = config.errorTierSounds[tierKey]?.trim();
  if (userTierPath) { return userTierPath; }

  const packFiles: Record<typeof tierKey, string> = {
    tier1: "faah-low.wav",
    tier2: "faah-mid.wav",
    tier3: "faah-high.wav",
  };
  const primary = getBundledSoundPath(context, config.soundPack, packFiles[tierKey]);
  if (fs.existsSync(primary)) { return primary; }

  // 4. Absolute fallback
  return path.join(context.extensionPath, "media", "faah.wav");
}

function resolveWarningSound(
  context: vscode.ExtensionContext,
  config: FaaaaahhhConfig,
  delta: number
): string {
  if (config.customWarningSoundFolder.trim()) {
    const picked = pickRandomFromFolder(config.customWarningSoundFolder.trim());
    if (picked) { return picked; }
  }

  if (config.customWarningSoundPath.trim()) {
    return config.customWarningSoundPath.trim();
  }

  const tierKey = delta >= 2 ? "tier2" : "tier1";
  const userTierPath = config.warningTierSounds[tierKey]?.trim();
  if (userTierPath) { return userTierPath; }

  const packFiles: Record<typeof tierKey, string> = {
    tier1: "aa-low.wav",
    tier2: "aa-high.wav",
  };
  const primary = getBundledSoundPath(context, config.soundPack, packFiles[tierKey]);
  if (fs.existsSync(primary)) { return primary; }

  return path.join(context.extensionPath, "media", "aa.wav");
}

function resolveVictorySound(
  context: vscode.ExtensionContext,
  config: FaaaaahhhConfig
): string {
  if (config.customVictoryPath.trim()) { return config.customVictoryPath.trim(); }
  const primary = getBundledSoundPath(context, config.soundPack, "victory.wav");
  if (fs.existsSync(primary)) { return primary; }
  return path.join(context.extensionPath, "media", "aa.wav");
}

// ── Platform players ───────────────────────────────────────────────────────────

function getPlayScript(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, "media", "play.ps1");
}

function playOnWindows(context: vscode.ExtensionContext, soundPath: string): void {
  const scriptPath = getPlayScript(context);
  const proc = execFile("powershell.exe", [
    "-NoProfile",
    "-WindowStyle", "Hidden",
    "-ExecutionPolicy", "Bypass",
    "-File", scriptPath,
    "-Path", soundPath,
  ], { windowsHide: true }, (error, _stdout, stderr) => {
    if (error) { log(`Playback error: ${error.message}`); }
    if (stderr) { log(`Playback stderr: ${stderr}`); }
    activeProcesses.delete(proc);
  });
  activeProcesses.add(proc);
  proc.unref();
  log(`Spawned sound process (PID: ${proc.pid})`);
}

function playOnMacOS(soundPath: string): void {
  const proc = execFile("afplay", [soundPath], (error) => {
    if (error) { log(`Playback error: ${error.message}`); }
    activeProcesses.delete(proc);
  });
  activeProcesses.add(proc);
  proc.unref();
}

function playOnLinux(soundPath: string): void {
  const proc = execFile("paplay", [soundPath], (error) => {
    if (error) {
      log("paplay failed, trying aplay...");
      const fallback = execFile("aplay", [soundPath], (err) => {
        if (err) { log(`aplay also failed: ${err.message}`); }
        activeProcesses.delete(fallback);
      });
      activeProcesses.add(fallback);
      fallback.unref();
    }
    activeProcesses.delete(proc);
  });
  activeProcesses.add(proc);
  proc.unref();
}

function dispatchToOS(context: vscode.ExtensionContext, soundPath: string): void {
  const platform = process.platform;
  if (platform === "win32") { playOnWindows(context, soundPath); }
  else if (platform === "darwin") { playOnMacOS(soundPath); }
  else { playOnLinux(soundPath); }
}

// ── Public API ─────────────────────────────────────────────────────────────────

export function playSound(
  context: vscode.ExtensionContext,
  kind: "error" | "warning" | "victory",
  delta: number = 1
): void {
  const config = getConfig();

  if (!config.enabled) { log("Skipped: extension disabled"); return; }
  if (kind === "warning" && !config.warningsEnabled) { return; }
  if (kind === "victory" && !config.victoryEnabled) { return; }

  if (isQuietHoursActive(config)) {
    log(`Skipped: quiet hours (${config.quietHoursStart}–${config.quietHoursEnd})`);
    return;
  }

  if (isCoolingDown(kind, config.cooldownMs)) {
    log(`Skipped: cooldown active for [${kind}]`);
    return;
  }

  let soundPath: string;
  if (kind === "victory") {
    soundPath = resolveVictorySound(context, config);
  } else if (kind === "error") {
    soundPath = resolveErrorSound(context, config, delta);
  } else {
    soundPath = resolveWarningSound(context, config, delta);
  }

  if (!fs.existsSync(soundPath)) {
    log(`Sound file not found: ${soundPath}`);
    vscode.window.showWarningMessage(`Faaaaaahhh: Sound file not found: ${soundPath}`);
    return;
  }

  recordPlayed(kind);
  log(`Playing [${kind}] delta=${delta} tier=${delta >= 5 ? "3" : delta >= 2 ? "2" : "1"}: ${soundPath}`);
  dispatchToOS(context, soundPath);
}

// Backward-compatible wrappers (taskWatcher / debugWatcher use these)
export function playFaaah(context: vscode.ExtensionContext): void {
  playSound(context, "error", 1);
}

export function playAa(context: vscode.ExtensionContext): void {
  playSound(context, "warning", 1);
}

export function playVictory(context: vscode.ExtensionContext): void {
  playSound(context, "victory", 0);
}

export function killSound(): void {
  for (const proc of activeProcesses) {
    if (!proc.killed) { proc.kill(); }
  }
  activeProcesses.clear();
}
