# lazydir

### WIP

A cross platform file manager you _probably_ don't need.

Lazydir is a file manager built with Go, Wails and React. It offers a clean, tabbed, split-screen interface to make managing your files a breeze.

![Lazydir Screenshot](branding/lazydirmac.png)

## Features

- **Split-Screen View**: Manage files and directories side-by-side with dual panes for maximum productivity.
  ![Split](branding/splitscreen.png)

- **Tabbed Interface**: Keep multiple directories open in tabs and switch between them effortlessly.
- **Cross-Platform**: A single, consistent experience on Linux, Windows, and macOS.
- **Custom Themes**: Personalize the look and feel to match your style.

![FileGrid](branding/filegrid.png)

## Installation

Packages are available for Linux distributions, Windows & MacOS. You can find the latest builds on the project's releases page.

- **Windows**:

  - Download the **installer**: `lazydir-amd64-installer.exe`
  - Or download the **portable binary**: `lazydir.exe`

- **macOS**:

  - Download the **app bundle archive**: `lazydir.app.zip`
    _(no `.dmg` is provided)_

- **Debian / Ubuntu**:

  - Download the `.deb` package: `lazydir.deb`

- **Fedora / CentOS / RHEL**:

  - Download the `.rpm` package: `lazydir.rpm`

- **Arch Linux**:

  - Download the `.pkg.tar.zst` package: `lazydir.pkg.tar.zst`

## Building from Source

### Prerequisites

1.  **Go**: Install the Go programming language.
2.  **Wails v3**: Install the Wails v3 alpha by following the [official guide](https://v3alpha.wails.io/).
3.  **Task**: Install Task by following its [installation instructions](https://taskfile.dev/docs/installation).
4.  **Linux Dependencies**: If you are on Debian/Ubuntu, install the required libraries:
    ```bash
    sudo apt install build-essential pkg-config libgtk-3-dev libwebkit2gtk-4.0-dev
    ```

### Development Commands

- **Run in development mode**:
  ```bash
  task dev
  ```
- **Build the application**:
  ```bash
  task build
  ```
- **Package for distribution**:
  ```bash
  task package
  ```
- **Update embedded assets**:
  The frontend assets are embedded in the Go binary. To update them, modify the assets in `frontend/dist` and run:
  ```bash
  task common:update:assets
  ```

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Theme showcase

Its all CSS.

![Light Theme](branding/light.png)

![Dracula Theme](branding/dracula.png)
