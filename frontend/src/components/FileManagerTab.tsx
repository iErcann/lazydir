import { Tab } from "../types";
import { SplitView } from "./SplitView";

interface FileManagerTabProps {
  tab: Tab;
}
export function FileManagerTab({ tab }: FileManagerTabProps) {
  return (
    <>
      <SplitView tab={tab} />
    </>
  );
}
