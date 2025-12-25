import { SortingState } from "@tanstack/react-table";

export enum ViewMode {
  GRID = "grid",
  LIST = "list",
}
export interface Pane {
  id: string;

  // Navigation
  path: string;

  // View settings
  viewMode: ViewMode;
  sorting: SortingState;
  active: boolean;

  // Selected files
  selectedFilePaths: Set<string>; // array of file paths

  // Navigation history
  history: string[];        // all visited paths
  historyIndex: number;     // points to the current path in history
}

export interface Tab {
  id: string;
  panes: Pane[];
  splitPercentage?: number; // For 2-pane splits
  activePaneId?: string; // ← track the active pane directly
}
