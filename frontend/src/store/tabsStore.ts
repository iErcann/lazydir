import { create } from "zustand";
import type { Pane, Tab } from "../types";

interface TabsStore {
  // State
  tabs: Tab[];
  activeTabId: string | null;

  // Actions
  createTab: (path?: string) => Tab;
  closeTab: (tabId: string) => void;
  activateTab: (tabId: string) => void;

  createPane: (tabId: string, path?: string) => Pane;
  closePane: (tabId: string, paneId: string) => void;
  // navigatePane: (tabId: string, paneId: string, path: string) => void;
  // updatePane: (tabId: string, paneId: string, updates: Partial<Pane>) => void;

  // splitPane: (
  //   tabId: string,
  //   paneId: string,
  //   direction: "horizontal" | "vertical"
  // ) => void;
  // unsplitPane: (tabId: string, paneId: string) => void;

  // // Getters
  getActiveTab: () => Tab | null;
  getPane: (tabId: string, paneId: string) => Pane | null;
}

export const useTabsStore = create<TabsStore>((set, get) => ({
  tabs: [],
  activeTabId: null,
  activePaneIds: {},

  createTab: (path = ".") => {
    const newTab: Tab = {
      id: `tab-${Date.now()}`,
      name: "New Tab",
      panes: [
        {
          id: `pane-${Date.now()}`,
          path,
          name: "Root",
        },
      ],
    };
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }));
    return newTab;
  },

  activateTab: (tabId: string) => {
    set({ activeTabId: tabId });
  },

  closeTab: (tabId: string) => {
    set((state) => {
      // Remove the closed tab from the tabs array
      const updatedTabs = state.tabs.filter((tab) => tab.id !== tabId);

      // Determine the new active tab:
      // - If the closed tab was active AND there are other tabs → activate the first remaining tab
      // - If the closed tab was active AND there are no tabs left → activeTabId becomes null
      // - Otherwise → keep the current activeTabId
      const newActiveTabId =
        state.activeTabId === tabId && updatedTabs.length > 0
          ? updatedTabs[0].id
          : state.activeTabId === tabId
          ? null
          : state.activeTabId;

      // Final updated state
      return {
        tabs: updatedTabs,
        activeTabId: newActiveTabId,
      };
    });
  },

  createPane: (tabId: string, path = ".") => {
    const newPane: Pane = {
      id: `pane-${Date.now()}`,
      path,
      name: "New Pane",
    };
    set((state) => ({
      tabs: state.tabs.map((tab) => {
        if (tab.id !== tabId) return tab;
        return {
          ...tab,
          panes: [...tab.panes, newPane],
        };
      }),
    }));
    return newPane;
  },
  closePane: (tabId: string, paneId: string) => {
    set((state) => {
      // Get the tab we are modifying
      const tab = state.tabs.find((t) => t.id === tabId);
      if (!tab) return state; // Safety guard (tab may not exist)
      if (tab.panes.length <= 1) return state; // Don't close last pane

      // Remove the pane from the tab
      const updatedPanes = tab.panes.filter((p) => p.id !== paneId);

      return {
        // Update tabs with modified pane list
        tabs: state.tabs.map((t) =>
          t.id === tabId ? { ...t, panes: updatedPanes } : t
        ),
      };
    });
  },
  getActiveTab: () => {
    const { tabs, activeTabId } = get();
    return tabs.find((t) => t.id === activeTabId) || null;
  },

  getPane: (tabId: string, paneId: string) => {
    const { tabs } = get();
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return null;
    return tab.panes.find((p) => p.id === paneId) || null;
  },
}));
