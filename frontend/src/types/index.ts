export interface Pane {
  id: string;

  // Navigation
  path: string;

  // View settings
  viewMode?: "grid" | "list";
  sortBy?: "name" | "size" | "date"; // TODO: use this to now lose sorting on pane switch
  active: boolean;

  // Selected files
  selectedFilesPath?: Set<string>; // array of file paths
}

export interface Tab {
  id: string;
  panes: Pane[];
  splitPercentage?: number; // For 2-pane splits
}
