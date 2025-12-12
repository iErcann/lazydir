import { Tab } from "../types";
import { SplitView } from "./SplitView";
import { TabBar } from "./TabBar";

export function FileManagerTab({ tab }: { tab: Tab }) {
  return (
    <>
      <TabBar />
      <SplitView  tab={tab} />
    </>
  );
}
