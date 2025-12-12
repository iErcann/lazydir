import type { Pane } from "../types";
import { FileManagerPane } from "./FileManagerPane";

export function SplitView({
  panes,
}: {
  panes: Pane[];
}) {
  // Single pane
  if (panes.length === 1) {
    return <FileManagerPane pane={panes[0]}   />;
  }

  // Two panes with splitter
  return (
    <div className="flex h-full">
      <div className="w-1/2">
        <FileManagerPane pane={panes[0]}   />
      </div>
      <div className="w-1 bg-gray-800 cursor-col-resize" />
      <div className="w-1/2">
        <FileManagerPane pane={panes[1]}   />
      </div>
    </div>
  );
}
