import { Tab } from "../types";
import { SplitView } from "./SplitView";

export function FileManagerTab({ tab }: { tab: Tab }) {
  return (
    <>
      <SplitView tab={tab} />
    </>
  );
}
