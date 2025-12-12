import type { Pane, Tab } from "../types";
import { FileManagerPane } from "./FileManagerPane";

export function SplitView({
  tab,
}: {
  tab: Tab;
}) {
  // Single pane
  if (tab.panes.length === 1) {
    return <FileManagerPane tab={tab} pane={tab.panes[0]}   />;
  }

  // Two panes with splitter
  return (
    <div className="flex h-full">
      <div className="w-1/2">
        <FileManagerPane tab={tab} pane={tab.panes[0]}   />
      </div>
      <div className="w-1 bg-gray-800 cursor-col-resize" />
      <div className="w-1/2">
        <FileManagerPane tab={tab} pane={tab.panes[1]}   />
      </div>
    </div>
  );
}


