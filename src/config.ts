import * as vscode from "vscode";

export interface FaaaaahhhConfig {
  enabled: boolean;
  warningsEnabled: boolean;
  cooldownMs: number;
  customSoundPath: string;
  customWarningSoundPath: string;
}

export function getConfig(): FaaaaahhhConfig {
  const cfg = vscode.workspace.getConfiguration("faaaaaahhh");
  return {
    enabled: cfg.get<boolean>("enabled", true),
    warningsEnabled: cfg.get<boolean>("warningsEnabled", true),
    cooldownMs: cfg.get<number>("cooldownMs", 0),
    customSoundPath: cfg.get<string>("customSoundPath", ""),
    customWarningSoundPath: cfg.get<string>("customWarningSoundPath", ""),
  };
}
