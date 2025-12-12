// import { useState } from "react";

// function TabManager() {
//   const [tabs, setTabs] = useState<Tab[]>([
//     {
//       id: "1",
//       name: "Documents",
//       panes: [
//         {
//           id: "pane1",
//           path: ".",
//           name: "Documents",
//         },
//       ],
//     },
//   ]);

//   const [activeTabId, setActiveTabId] = useState("1");
//   const activeTab = tabs.find((t) => t.id === activeTabId);

//   // Add split: just add another pane to the array
//   const splitActiveTab = (direction: "horizontal" | "vertical") => {
//     if (!activeTab) return;

//     const activePane = activeTab.panes[0];
//     setTabs((prev) =>
//       prev.map((tab) => {
//         if (tab.id !== activeTabId) return tab;

//         return {
//           ...tab,
//           panes: [
//             ...tab.panes,
//             {
//               id: `pane-${Date.now()}`,
//               path: activePane.path,
//               name: `${activePane.name} (2)`,
//             },
//           ],
//         };
//       })
//     );
//   };

//   // Remove split: just remove the second pane
//   const unsplitActiveTab = () => {
//     if (!activeTab || activeTab.panes.length <= 1) return;

//     setTabs((prev) =>
//       prev.map((tab) => {
//         if (tab.id !== activeTabId) return tab;

//         return {
//           ...tab,
//           panes: [tab.panes[0]], // Keep only first pane
//         };
//       })
//     );
//   };

//   const closePane = (paneId: string) => {
//     if (!activeTab) return;

//     // Don't close the last pane
//     if (activeTab.panes.length <= 1) return;

//     setTabs((prev) =>
//       prev.map((tab) => {
//         if (tab.id !== activeTabId) return tab;

//         return {
//           ...tab,
//           panes: tab.panes.filter((p) => p.id !== paneId),
//         };
//       })
//     );
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Tab Bar - Simplified */}
//       <TabBar
//         tabs={tabs}
//         activeTabId={activeTabId}
//         onTabSelect={setActiveTabId}
//         onSplit={() => splitActiveTab("horizontal")}
//         onUnsplit={unsplitActiveTab}
//         canSplit={activeTab?.panes.length === 1}
//         canUnsplit={activeTab?.panes.length === 2}
//       />

//       {/* Always use SplitView - it handles 1 or 2 panes */}
//       {activeTab && (
//         <SplitView
//           panes={activeTab.panes}
//           splitPercentage={activeTab.splitPercentage || 50}
//           onSplitChange={(percentage) =>
//             updateSplitPercentage(activeTabId, percentage)
//           }
//           onPaneNavigate={(paneId, path, name) =>
//             updatePane(activeTabId, paneId, path, name)
//           }
//           onPaneClose={closePane}
//         />
//       )}
//     </div>
//   );
// }
