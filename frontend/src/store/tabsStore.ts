import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Pane, Tab } from "../types";
import { SortingState } from "@tanstack/react-table";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface TabsStore {
  tabs: Tab[];
  activeTabId: string | null;

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
    selectedFilePaths: Set<string>
  ) => void;
  setPaneSorting: (
    tabId: string,
    paneId: string,
    sorting: SortingState
  ) => void;

  // Getters (unchanged - they don't mutate)
  getActiveTab: () => Tab | null;
  getActivePane: () => Pane | null;
  getPane: (tabId: string, paneId: string) => Pane | null;
}

export const useTabsStore = create<TabsStore>()(
  immer((set, get) => ({
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
            viewMode: "list", // ← added default (optional but recommended)
            sorting: [{ id: "name", desc: false }],
            selectedFilePaths: new Set<string>(),
          },
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

        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;

        const hasActivePane = tab.panes.some((p: Pane) => p.active);
        if (!hasActivePane && tab.panes.length > 0) {
          tab.panes.forEach((p: Pane, i: number) => {
            p.active = i === 0;
          });
        }
      });
    },

    activatePane: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;

        const targetPane = tab.panes.find((p: Pane) => p.id === paneId);
        if (!targetPane || targetPane.active) return;

        // Deactivate all, activate target
        tab.panes.forEach((p: Pane) => {
          p.active = p.id === paneId;
        });
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

    createPane: (tabId: string, path = ".") => {
      const newPane: Pane = {
        id: generateUUID(),
        path,
        active: true,
        viewMode: "list", // ← default
        sorting: [{ id: "name", desc: false }],
        selectedFilePaths: new Set<string>(),
      };

      set((state) => {
        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;

        // Deactivate others, add new active pane
        tab.panes.forEach((p: Pane) => {
          p.active = false;
        });
        tab.panes.push(newPane);
      });

      return newPane;
    },

    updatePanePath: (tabId: string, paneId: string, newPath: string) => {
      set((state) => {
        // Do lookup on draft state – not on get()
        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;

        const pane = tab.panes.find((p: Pane) => p.id === paneId);
        if (pane) {
          pane.path = newPath; // ← now safe: mutating draft
        }
      });
    },

    closePane: (tabId: string, paneId: string) => {
      set((state) => {
        const tab = state.tabs.find((t: Tab) => t.id === tabId);
        if (!tab) return;

        const index = tab.panes.findIndex((p: Pane) => p.id === paneId);
        if (index === -1) return;

        const wasActive = tab.panes[index].active;

        tab.panes.splice(index, 1);

        // If we closed the active pane → activate first remaining one
        if (wasActive && tab.panes.length > 0) {
          tab.panes[0].active = true;
        }
      });
    },

    setSelectedFilePaths: (
      tabId: string,
      paneId: string,
      selectedFilePaths: Set<string>
    ) => {
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

    // Getters
    getActiveTab: () => {
      const { tabs, activeTabId } = get();
      return tabs.find((t: Tab) => t.id === activeTabId) ?? null;
    },

    getActivePane: () => {
      const tab = get().getActiveTab();
      return tab?.panes.find((p: Pane) => p.active) ?? null;
    },

    getPane: (tabId: string, paneId: string) => {
      const { tabs } = get();
      const tab = tabs.find((t: Tab) => t.id === tabId);
      return tab?.panes.find((p: Pane) => p.id === paneId) ?? null;
    },
  }))
);
