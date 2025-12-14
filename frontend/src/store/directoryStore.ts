import { create } from "zustand";
import {
  AppError,
  DirectoryContents,
  FileManagerService,
} from "../../bindings/lazydir/internal";
import { OperatingSystem, Result } from "../../bindings/lazydir/internal/models";

interface FileSystemStore {
  operatingSystem: OperatingSystem;
  setOperatingSystem: (os: OperatingSystem) => void;  
  // Actions
  loadDirectory: (path: string) => Promise<Result<DirectoryContents>>;
  getOperatingSystem: () => Promise<Result<OperatingSystem>>;
}


export const useFileSystemStore = create<FileSystemStore>((set) => ({
  operatingSystem: OperatingSystem.OSLinux,  

  setOperatingSystem: (os: OperatingSystem) => set({ operatingSystem: os }),

  loadDirectory: async (path) => {
    return await FileManagerService.ListDirectory(path);
  },

  getOperatingSystem: async () => {
    const result = await FileManagerService.GetOperatingSystem();
    if (result.data) {
      set({ operatingSystem: result.data });  
    }
    return result;
  },
}));
