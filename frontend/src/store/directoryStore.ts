import { create } from "zustand";
import {
  AppError,
  DirectoryContents,
  FileManagerService,
} from "../../bindings/lazydir/internal";
import { Result } from "../../bindings/lazydir/internal/models";

interface FileSystemStore {
  // Actions
  loadDirectory: (path: string) => Promise<Result<DirectoryContents>>;
}

export const useFileSystemStore = create<FileSystemStore>((_set, _get) => ({
  loadDirectory: async (path) => {
    return await FileManagerService.ListDirectory(path);
  },
}));
