# ![](../assets/icons/favicon-64x64.png) Aerofly Startgerät - GUI App

![](./gui-example.png)

## Requirements

This application supports computers running Microsoft Windows, Apple OSX and Linux.

The Aerofly Startgerät is a Command Line Interface (CLI) tool, which means you need to open a terminal to run it.

## Installation

1. Download the latest Aerofly Startgerät GUI app from the Github releases at https://github.com/fboes/aerofly-startgeraet/releases/latest.
2. Move the Aerofly Startgerät GUI app to a sensible location and mark it as executable (see below).
3. Start the Aerofly Startgerät GUI app (see below).

#### Linux / macOS

After downloading, mark the file as executable:

```bash
# Linux
chmod +x aerofly-startgeraet-gui-linux
# or on macOS
chmod +x aerofly-startgeraet-gui-macos
```

Then run it:

```bash
# Linux
./aerofly-startgeraet-gui-linux
# or on macOS
./aerofly-startgeraet-gui-macos
```

#### macOS Gatekeeper

macOS may block the file as it is from an unidentified developer. To allow it:

```bash
xattr -dr com.apple.quarantine aerofly-startgeraet-gui-macos
```

Or via **System Settings → Privacy & Security → Allow anyway**.

#### Windows

Simply double-click `aerofly-startgeraet-gui-windows.exe` or run it in PowerShell:

```powershell
.\aerofly-startgeraet-gui-windows.exe
```

For convenience you may want to add a desktop shortcut:

1. Right click on th the application
2. Select "Create Shortcut"
3. Drag the shortcut to your desktop

## Usage

Call this tool by double-clicking the GUI app. On a successful start-up, you will see a main app windows. After changing settings int the app windows, changes will be saved to the `main.mcf` after a second of inactivity.

> [!WARNING]
> The Aerofly Startgerät may break your `main.mcf`. Be sure to have a backup of this file.

---

[Back to top](../README.md)
