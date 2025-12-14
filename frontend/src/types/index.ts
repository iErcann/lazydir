export interface Pane {
  id: string;
  path: string;
  viewMode?: "grid" | "list";
  sortBy?: "name" | "size" | "date";
  active: boolean;
}

export interface Tab {
  id: string;
  panes: Pane[];
  splitPercentage?: number; // For 2-pane splits
}
