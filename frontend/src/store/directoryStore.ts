import { create } from "zustand";
import { FileManagerService } from "../../bindings/lazydir/internal/index";
import { DirectoryContents } from "../../bindings/lazydir/internal/models";

interface FileSystemStore {
  // Actions
  loadDirectory: (path: string) => Promise<DirectoryContents>;
}

export const useFileSystemStore = create<FileSystemStore>((_set, _get) => ({
  loadDirectory: async (path) => {
    // Fetch from backend
    return await FileManagerService.ListDirectory(path);
  },
}));
