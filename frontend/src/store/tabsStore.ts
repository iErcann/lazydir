import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ViewMode, type Pane, type Tab } from '../types';
import { SortingState } from '@tanstack/react-table';
import { FileInfo } from '../../bindings/lazydir/internal';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ActivePaneResult {
  tab: Tab;
  pane: Pane;
}

interface TabsStore {
  tabs: Tab[];
  activeTabId: string | null;

  clipboard: {
    filePaths: string[];
    cutMode: boolean; // if its a cut, then we move files, else we copy
  };
  clearClipboard: () => void;
  copyFiles: (filePaths: string[], cutMode?: boolean) => void;
  createTab: (path?: string) => Tab;
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;
  activatePane: (tabId: string, paneId: string) => void;

  createPane: (tabId: string, path?: string) => Pane;
  closePane: (tabId: string, paneId: string) => void;
  updatePanePath: (tabId: string, paneId: string, newPath: string) => void;
  refreshPane: (tabId: string, paneId: string) => void;

  // History navigation
  paneNavigateBack: (tabId: string, paneId: string) => void;
  paneNavigateForward: (tabId: string, paneId: string) => void;

  setSelectedFilePaths: (tabId: string, paneId: string, selectedFilePaths: Set<string>) => void;
  setPaneSorting: (tabId: string, paneId: string, sorting: SortingState) => void;

  setPaneViewMode: (tabId: string, paneId: string, viewMode: ViewMode) => void;
  setPaneStatus: (tabId: string, paneId: string, message?: string) => void;

  // Getters (unchanged - they don't mutate)
  getActiveTab: () => Tab | null;
  getActivePane: () => ActivePaneResult | null;
  getPane: (tabId: string, paneId: string) => Pane | null;
  getTab: (tabId: string) => Tab | null;
}

export const useTabsStore = create<TabsStore>()(
  immer((set, get) => ({
    tabs: [],
    activeTabId: null,
    clipboard: { filePaths: [], cutMode: false },

    clearClipboard: () => {
      set((state) => {
        state.clipboard.filePaths = [];
        state.clipboard.cutMode = false;
      });
    },

    copyFiles: (files, cutMode = false) => {
      set((state) => {
        state.clipboard.filePaths = files;
        state.clipboard.cutMode = cutMode;
      });
    },

    createTab: (path = '.') => {
      const defaultPane: Pane = {
        id: generateUUID(),
        path,
        active: true,
        viewMode: ViewMode.LIST,
        sorting: [{ id: 'name', desc: false }],
        selectedFilePaths: new Set<string>(),
        history: [path],
        historyIndex: 0,
        refreshKey: 0,
      };
      const newTab: Tab = {
        id: generateUUID(),
        activePaneId: defaultPane.id,
        panes: [
          defaultPane,
          // {
          //   ...defaultPane,
          //   id: generateUUID(),
          // },
        ],
      };

      set((state) => {
        state.tabs.push(newTab);
        state.activeTabId = newTab.id;
      });

      return newTab;
    },

    activateTab: (tabId: string) => {
      set((state) => {
        state.activeTabId = tabId;

        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        // Ensure there is an active pane
        if (!tab.activePaneId && tab.panes.length > 0) {
          tab.activePaneId = tab.panes[0].id;
        }
      });
    },

    activatePane: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const paneExists = tab.panes.some((p) => p.id === paneId);
        if (!paneExists) return;

        tab.activePaneId = paneId;
      });
    },

    closeTab: (tabId: string) => {
      set((state) => {
        if (state.tabs.length <= 1) return;

        const index = state.tabs.findIndex((t: Tab) => t.id === tabId);
        if (index === -1) return;

        state.tabs.splice(index, 1);

        if (state.activeTabId === tabId) {
          state.activeTabId = state.tabs[0]?.id ?? null;
        }
      });
    },

    createPane: (tabId: string, path = '.') => {
      const newPane: Pane = {
        id: generateUUID(),
        path,
        active: false, // no longer used
        viewMode: ViewMode.LIST,
        sorting: [{ id: 'name', desc: false }],
        selectedFilePaths: new Set<string>(),
        history: [path],
        historyIndex: 0,
        refreshKey: 0,
      };

      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        tab.panes.push(newPane);
        tab.activePaneId = newPane.id; // activate the new pane
      });

      return newPane;
    },

    updatePanePath: (tabId: string, paneId: string, newPath: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        // If navigating to a new path, drop forward history
        pane.history = pane.history.slice(0, pane.historyIndex + 1);

        // Avoid duplicate consecutive entries
        if (pane.history[pane.historyIndex] !== newPath) {
          pane.history.push(newPath);
          pane.historyIndex = pane.history.length - 1;
          pane.path = newPath;
        }
      });
    },

    refreshPane: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        // Increment refresh key to trigger React Query refetch
        pane.refreshKey++;
      });
    },

    paneNavigateBack: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        if (pane.historyIndex > 0) {
          pane.historyIndex--;
          pane.path = pane.history[pane.historyIndex];
        }
      });
    },

    paneNavigateForward: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        if (pane.historyIndex < pane.history.length - 1) {
          pane.historyIndex++;
          pane.path = pane.history[pane.historyIndex];
        }
      });
    },

    closePane: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const index = tab.panes.findIndex((p) => p.id === paneId);
        if (index === -1) return;

        tab.panes.splice(index, 1);

        // Update activePaneId if needed
        if (tab.activePaneId === paneId) {
          tab.activePaneId = tab.panes[0]?.id ?? undefined;
        }
      });
    },

    setSelectedFilePaths: (tabId: string, paneId: string, selectedFilePaths: Set<string>) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        // + Doc for set: https://zustand.docs.pmnd.rs/guides/maps-and-sets-usage#reading-a-set
        pane.selectedFilePaths = new Set(selectedFilePaths);
      });
    },

    setPaneSorting: (tabId: string, paneId: string, sorting: SortingState) => {
      set((state) => {
        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;
        const pane = tab.panes.find((p: Pane) => p.id === paneId);
        if (!pane) return;

        // Immer does not allow you to replace entire nested properties like Set or arrays/objects with completely new references unless you do it in a special way.
        pane.sorting = [...sorting];
      });
    },

    setPaneViewMode: (tabId: string, paneId: string, viewMode: ViewMode) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        pane.viewMode = viewMode;
      });
    },

    setPaneStatus: (tabId: string, paneId: string, message?: string) => {
      set((state) => {
        const tab = state.tabs.find((t) => t.id === tabId);
        if (!tab) return;

        const pane = tab.panes.find((p) => p.id === paneId);
        if (!pane) return;

        pane.statusMessage = message;
      });
    },

    // Getters
    getActiveTab: () => {
      const { tabs, activeTabId } = get();
      return tabs.find((t: Tab) => t.id === activeTabId) ?? null;
    },

    // Getter for active pane
    getActivePane: () => {
      const tab = get().getActiveTab();
      if (!tab) return null;

      const pane = tab.panes.find((p) => p.id === tab.activePaneId);
      if (!pane) return null;

      return { tab, pane };
    },

    getPane: (tabId: string, paneId: string) => {
      const { tabs } = get();
      const tab = tabs.find((t: Tab) => t.id === tabId);
      return tab?.panes.find((p: Pane) => p.id === paneId) ?? null;
    },
    getTab: (tabId: string) => {
      const { tabs } = get();
      return tabs.find((t: Tab) => t.id === tabId) ?? null;
    },
  }))
);
