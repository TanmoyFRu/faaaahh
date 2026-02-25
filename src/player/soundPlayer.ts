import { execFile, ChildProcess } from "node:child_process";
import * as path from "node:path";
import * as fs from "node:fs";
import * as vscode from "vscode";
import { getConfig } from "../config";

let outputChannel: vscode.OutputChannel | null = null;
const activeProcesses: Set<ChildProcess> = new Set();

export function setOutputChannel(channel: vscode.OutputChannel): void {
  outputChannel = channel;
}

function log(msg: string): void {
  outputChannel?.appendLine(`[SoundPlayer] ${msg}`);
}

function resolveSound(
  context: vscode.ExtensionContext,
  kind: "error" | "warning"
): string {
  const config = getConfig();

  if (kind === "error" && config.customSoundPath.trim() !== "") {
    return config.customSoundPath;
  }
  if (kind === "warning" && config.customWarningSoundPath.trim() !== "") {
    return config.customWarningSoundPath;
  }

  const filename = kind === "error" ? "faah.wav" : "aa.wav";
  return path.join(context.extensionPath, "media", filename);
}

function getPlayScript(context: vscode.ExtensionContext): string {
  return path.join(context.extensionPath, "media", "play.ps1");
}

function playOnWindows(context: vscode.ExtensionContext, soundPath: string): void {
  const scriptPath = getPlayScript(context);

  // Use -File with the .ps1 script — zero quoting issues
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

export function playSound(
  context: vscode.ExtensionContext,
  kind: "error" | "warning" = "error"
): void {
  const config = getConfig();

  if (!config.enabled) {
    log("Skipped: extension disabled");
    return;
  }

  if (kind === "warning" && !config.warningsEnabled) {
    log("Skipped: warning sounds disabled");
    return;
  }

  const soundPath = resolveSound(context, kind);

  if (!fs.existsSync(soundPath)) {
    log(`ERROR: Sound file not found: ${soundPath}`);
    vscode.window.showWarningMessage(`Faaaaaahhh: Sound file not found: ${soundPath}`);
    return;
  }

  log(`Playing [${kind}]: ${soundPath}`);

  const platform = process.platform;
  if (platform === "win32") {
    playOnWindows(context, soundPath);
  } else if (platform === "darwin") {
    playOnMacOS(soundPath);
  } else {
    playOnLinux(soundPath);
  }
}

export function playFaaah(context: vscode.ExtensionContext): void {
  playSound(context, "error");
}

export function playAa(context: vscode.ExtensionContext): void {
  playSound(context, "warning");
}

export function killSound(): void {
  for (const proc of activeProcesses) {
    if (!proc.killed) { proc.kill(); }
  }
  activeProcesses.clear();
}
