<p align="center">
  <img src="assets/hero-banner.svg" alt="FAAAAAAHHH" width="100%"/>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=tanmoy-debnath.faaaaaahhh">
    <img src="https://img.shields.io/visual-studio-marketplace/v/tanmoy-debnath.faaaaaahhh?style=for-the-badge&color=FF3B3B&label=Marketplace" alt="Marketplace"/>
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=tanmoy-debnath.faaaaaahhh">
    <img src="https://img.shields.io/visual-studio-marketplace/i/tanmoy-debnath.faaaaaahhh?style=for-the-badge&color=2A2E3A&label=Installs" alt="Installs"/>
  </a>
  <a href="https://www.buymeacoffee.com/tanmoydn">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Support"/>
  </a>
</p>

---

## 🌩️ Auditory Feedback for Diagnostic Chaos

**Faaaaaahhh** is a Visual Studio Code extension designed to turn your developer suffering into high-fidelity entertainment. Every time a new error hits your editor, it plays the iconic **FAAAH** meme sound. Warnings? They get a softer, slightly less judgmental **AA**.

Whether it's a red squiggle, a failed build task, a crashed debug session, or a mistyped terminal command — if your code is broken, everyone in the room will know.

### 🌟 Key Features

- **📊 Severity Tiers** — Minor syntax typos are chill. Dropping 10 errors at once triggers high-frequency chaos.
- **🔊 Smart Audio Engine** — Works natively on Windows, macOS, and Linux with independent process spawning for realistic overlapping.
- **⚙️ Settings Panel** — A graphical UI to tune volume, cooldowns, and quiet hours without touching JSON.
- **📁 Sound Packs** — Switch between `Meme`, `Rage`, and `Chill` modes instantly.
- **🖥️ Terminal Watcher** — Caught slipping in the terminal? Non-zero exit codes trigger the sound too.
- **🏅 Victory Mode** — (Opt-in) A satisfying sound for when you finally clear all errors in a file.

---

## 🛠️ How it Works

<p align="center">
  <img src="assets/architecture.svg" alt="Architecture" width="100%"/>
</p>

The extension monitors four distinct VS Code event channels:

| Channel | Triggering Event | Sound |
|---|---|---|
| **Diagnostics** | `onDidChangeDiagnostics` | New red/yellow squiggles appear |
| **Tasks** | `onDidEndTaskProcess` | Build task fails with non-zero exit |
| **Terminal** | `onDidEndTerminalShellExecution` | Command not found or script failure |
| **Debug** | `onDidTerminateDebugSession` | Session crashes or exits with error |

**The Diff Engine:** We don't scream at you for existing errors. We only trigger sounds when the error count for a specific file **increases**.

---

## 🎮 Usage & Commands

Open the Command Palette (`Ctrl+Shift+P`) to access these tools:

| Command | Action |
|---|---|
| `Faaaaaahhh: Toggle Sound` | Quickly mute/unmute the extension |
| `Faaaaaahhh: Settings Panel` | Open the graphical configuration dashboard |
| `Faaaaaahhh: Test Sound` | Preview your current error sound pack |
| `Faaaaaahhh: Switch Pack` | Cycle between bundled sound profiles |

### 🕒 Quiet Hours
Don't get embarrassed during a screen share. Set **Quiet Hours** in the Settings Panel to automatically silence all sounds during specific windows (e.g., `09:00` to `17:00`).

---

## ⚙️ Configuration

While the Settings Panel is recommended, you can also configure everything in `settings.json`:

```json
{
  "faaaaaahhh.enabled": true,
  "faaaaaahhh.volume": 80,
  "faaaaaahhh.soundPack": "meme",
  "faaaaaahhh.quietHoursStart": "22:00",
  "faaaaaahhh.quietHoursEnd": "08:00",
  "faaaaaahhh.victoryEnabled": false
}
```

---

## 📦 Installation

**Marketplace:** Search for `Faaaaaahhh` in the VS Code extensions view.

**Manual:**
```bash
code --install-extension faaaaaahhh-0.2.2.vsix
```

---

<p align="center">
  <img src="assets/icon.svg" width="64" height="64"/><br/>
  <sub>Built with ❤️ (and 3 AM insanity) by <a href="https://github.com/TanmoyFRu">Tanmoy Debnath</a></sub><br/>
  <a href="LICENSE">MIT License</a>
</p>
