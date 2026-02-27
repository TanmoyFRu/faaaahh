import * as vscode from "vscode";

export interface TierSounds {
  tier1: string;
  tier2: string;
  tier3: string;
}

export interface WarningTierSounds {
  tier1: string;
  tier2: string;
}

export interface FaaaaahhhConfig {
  // Existing
  enabled: boolean;
  warningsEnabled: boolean;
  cooldownMs: number;
  customSoundPath: string;
  customWarningSoundPath: string;
  // Tiers
  errorTierSounds: TierSounds;
  warningTierSounds: WarningTierSounds;
  // Random folders
  customSoundFolder: string;
  customWarningSoundFolder: string;
  // Victory
  victoryEnabled: boolean;
  customVictoryPath: string;
  // Quiet hours
  quietHoursStart: string;
  quietHoursEnd: string;
  // Sound pack
  soundPack: "meme" | "rage" | "chill";
  // Streak
  streakThresholdToast: number;
  // Terminal mistype
  terminalSoundEnabled: boolean;
  customTerminalSoundPath: string;
}

export function getConfig(): FaaaaahhhConfig {
  const cfg = vscode.workspace.getConfiguration("faaaaaahhh");
  return {
    enabled: cfg.get<boolean>("enabled", true),
    warningsEnabled: cfg.get<boolean>("warningsEnabled", true),
    cooldownMs: cfg.get<number>("cooldownMs", 0),
    customSoundPath: cfg.get<string>("customSoundPath", ""),
    customWarningSoundPath: cfg.get<string>("customWarningSoundPath", ""),
    errorTierSounds: cfg.get<TierSounds>("errorTierSounds", { tier1: "", tier2: "", tier3: "" }),
    warningTierSounds: cfg.get<WarningTierSounds>("warningTierSounds", { tier1: "", tier2: "" }),
    customSoundFolder: cfg.get<string>("customSoundFolder", ""),
    customWarningSoundFolder: cfg.get<string>("customWarningSoundFolder", ""),
    victoryEnabled: cfg.get<boolean>("victoryEnabled", true),
    customVictoryPath: cfg.get<string>("customVictoryPath", ""),
    quietHoursStart: cfg.get<string>("quietHoursStart", ""),
    quietHoursEnd: cfg.get<string>("quietHoursEnd", ""),
    soundPack: cfg.get<"meme" | "rage" | "chill">("soundPack", "meme"),
    streakThresholdToast: cfg.get<number>("streakThresholdToast", 10),
    terminalSoundEnabled: cfg.get<boolean>("terminalSoundEnabled", true),
    customTerminalSoundPath: cfg.get<string>("customTerminalSoundPath", ""),
  };
}
