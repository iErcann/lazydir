import { create } from "zustand";
import type { Pane, Tab } from "../types";
import { SortingState } from "@tanstack/react-table";

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface TabsStore {
  // State
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  createTab: (path?: string) => Tab;
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;
  activatePane: (tabId: string, paneId: string) => void;

  createPane: (tabId: string, path?: string) => Pane;
  closePane: (tabId: string, paneId: string) => void;
  updatePanePath: (tabId: string, paneId: string, newPath: string) => void;

  setSelectedFilePaths: (
    tabId: string,
    paneId: string,
    selectedFilePaths: Set<string>,
  ) => void; 

  setPaneSorting: (
    tabId: string,
    paneId: string,
    sorting: SortingState,
  ) => void;

  // Getters
  getActiveTab: () => Tab | null;
  getActivePane: () => Pane | null;
  getPane: (tabId: string, paneId: string) => Pane | null;
}

export const useTabsStore = create<TabsStore>((set, get) => ({
  tabs: [],
  activeTabId: null,

  createTab: (path = ".") => {
    const newTab: Tab = {
      id: generateUUID(),
      panes: [
        {
          id: generateUUID(),
          path,
          active: true,
          selectedFilePaths: new Set<string>(),
          sorting: [{ id: "name", desc: false }],
        },
        // {
        //   id: generateUUID(),
        //   path,
        //   active: true,
        //   selectedFilePaths: new Set<string>(),
        // },
      ],
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
    return newTab;
  },

  activateTab: (tabId: string) => {
    set((state) => ({
      activeTabId: tabId,
      // When activating a tab, make sure only one pane in that tab is active
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        // Find the currently active pane in this tab
        const hasActivePane = tab.panes.some((pane) => pane.active);
        // If no pane is active, activate the first one
        if (!hasActivePane && tab.panes.length > 0) {
          return {
            ...tab,
            panes: tab.panes.map((pane, index) => ({
              ...pane,
              active: index === 0,
            })),
          };
        }
        return tab;
      }),
    }));
  },

  activatePane: (tabId: string, paneId: string) => {
    set((state) => {
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return state;

      const paneAlreadyActive = tab.panes.find((p) => p.id === paneId)?.active;
      if (paneAlreadyActive) return state; // no change → no rerender

      return {
        tabs: state.tabs.map((tab) => {
          if (tab.id !== tabId) return tab;
          return {
            ...tab,
            panes: tab.panes.map((pane) => ({
              ...pane,
              active: pane.id === paneId,
            })),
          };
        }),
      };
    });
  },

  closeTab: (tabId: string) => {
    if (get().tabs.length === 1) return; // Prevent closing the last tab
    set((state) => {
      const updatedTabs = state.tabs.filter((tab) => tab.id !== tabId);
      const newActiveTabId =
        state.activeTabId === tabId && updatedTabs.length > 0
          ? updatedTabs[0].id
          : state.activeTabId === tabId
          ? null
          : state.activeTabId;

      return {
        tabs: updatedTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  createPane: (tabId: string, path = ".") => {
    const newPane: Pane = {
      id: generateUUID(),
      path,
      active: true, // New pane becomes active
      selectedFilePaths: new Set<string>(),
    };

    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          // Deactivate all other panes, activate the new one
          panes: tab.panes
            .map((pane) => ({ ...pane, active: false }))
            .concat(newPane),
        };
      }),
    }));
    return newPane;
  },

  updatePanePath: (tabId: string, paneId: string, newPath: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          panes: tab.panes.map((pane) => {
            if (pane.id !== paneId) return pane;
            return { ...pane, path: newPath };
          }),
        };
      }),
    }));
  },

  closePane: (tabId: string, paneId: string) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        const updatedPanes = tab.panes.filter((p) => p.id !== paneId);

        // If we closed the active pane and there are other panes,
        // activate the first remaining pane
        const closedPane = tab.panes.find((p) => p.id === paneId);
        if (closedPane?.active && updatedPanes.length > 0) {
          updatedPanes[0].active = true;
        }

        return {
          ...tab,
          panes: updatedPanes,
        };
      }),
    }));
  },

  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId) || null;
  },

  getActivePane: () => {
    const { tabs, activeTabId } = get();
    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return null;
    return tab.panes.find((p) => p.active) || null;
  },

  getPane: (tabId: string, paneId: string) => {
    const { tabs } = get();
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return null;
    return tab.panes.find((p) => p.id === paneId) || null;
  },

  setSelectedFilePaths: (tabId: string, paneId: string, selectedFiles: Set<string>) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          panes: tab.panes.map((pane) => {
            if (pane.id !== paneId) return pane;
            return { ...pane, selectedFilePaths: new Set(selectedFiles) };
          }),
        };
      }),
    }));
  },

  setPaneSorting: (tabId: string, paneId: string, sorting: SortingState) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          panes: tab.panes.map((pane) => {
            if (pane.id !== paneId) return pane;
            return { ...pane, sorting };
          }),
        };
      }),
    }));
  },
}));
