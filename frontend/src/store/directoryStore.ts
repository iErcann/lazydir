import { create } from "zustand";
import {
  DirectoryContents,
  FileManagerService,
  DialogService, // UI
} from "../../bindings/lazydir/internal";
import {
  OperatingSystem,
  Result,
  PathInfo,
  Shortcut,
} from "../../bindings/lazydir/internal/models";

interface FileSystemStore {
  operatingSystem: OperatingSystem;
  setOperatingSystem: (os: OperatingSystem) => void;
  listDirectory: (path: string) => Promise<Result<DirectoryContents>>;
  getOperatingSystem: () => Promise<Result<OperatingSystem>>;
  getPathInfo: (path: string) => Promise<Result<PathInfo>>; // Cross platform path info retrieval
  getPathAtIndex: (path: string, index: number) => Promise<Result<string>>; // Get path at specific index
  getInitialPath: () => Promise<Result<string>>; // Get initial path based on OS
  getShortcuts: () => Promise<Result<Shortcut[]>>; // Get sidebar shortcuts
  pasteFiles: (
    files: string[],
    destinationPath: string,
    cutMode: boolean
  ) => Promise<Result<string>>; // Paste files to destination
  openFileWithDefaultApp: (path: string) => Promise<Result<string>>; // Open file with default application
  // UI
  showInfoDialog: (title: string, message: string) => void;
  showErrorDialog: (title: string, message: string) => void;
  showWarningDialog: (title: string, message: string) => void;
}

export const useFileSystemStore = create<FileSystemStore>((set) => ({
  operatingSystem: OperatingSystem.OSLinux,

  setOperatingSystem: (os: OperatingSystem) => set({ operatingSystem: os }),

  listDirectory: async (path) => {
    return await FileManagerService.ListDirectory(path);
  },

  getOperatingSystem: async () => {
    const result = await FileManagerService.GetOperatingSystem();
    if (result.data) {
      set({ operatingSystem: result.data });
    }
    return result;
  },

  getPathInfo: async (path: string) => {
    return await FileManagerService.GetPathInfo(path);
  },
  getPathAtIndex: async (path: string, index: number) => {
    return await FileManagerService.GetPathAtIndex(path, index);
  },

  getInitialPath: async () => {
    return await FileManagerService.GetInitialPath();
  },
  getShortcuts: async () => {
    return await FileManagerService.GetShortcuts();
  },

  pasteFiles: async (
    files: string[],
    destinationPath: string,
    cutMode: boolean
  ) => {
    return await FileManagerService.PasteFiles(destinationPath, files, cutMode);
  },

  showInfoDialog: (title: string, message: string) => {
    DialogService.ShowInfoDialog(title, message);
  },
  showErrorDialog: (title: string, message: string) => {
    DialogService.ShowErrorDialog(title, message);
  },
  showWarningDialog: (title: string, message: string) => {
    DialogService.ShowWarningDialog(title, message);
  },
  openFileWithDefaultApp: async (path: string) => {
    return await FileManagerService.OpenFileWithDefaultApp(path);
  },
}));
