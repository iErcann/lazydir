import { create } from "zustand";
import {
  DirectoryContents,
  FileManagerService,
} from "../../bindings/lazydir/internal";
import { OperatingSystem, Result, PathInfo } from "../../bindings/lazydir/internal/models";

interface FileSystemStore {
  operatingSystem: OperatingSystem;
  setOperatingSystem: (os: OperatingSystem) => void;  
  // Actions
  loadDirectory: (path: string) => Promise<Result<DirectoryContents>>;
  getOperatingSystem: () => Promise<Result<OperatingSystem>>;
  getPathInfo: (path: string) => Promise<Result<PathInfo>>; // Cross platform path info retrieval
  getPathAtIndex: (path: string, index: number) => Promise<Result<string>>; // Get path at specific index
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

  getPathInfo: async (path: string) => {
     return await FileManagerService.GetPathInfo(path);
  },
  getPathAtIndex: async (path: string, index: number) => {
    return await FileManagerService.GetPathAtIndex(path, index);
  }
}));
