import { create } from "zustand";
import { DirectoryContents, FileManagerService } from "../../bindings/lazydir/internal";

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
