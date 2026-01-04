import { SplitView } from "./SplitView";

interface FileManagerTabProps {
  tabId: string;
}
export function FileManagerTab({ tabId }: FileManagerTabProps) {
  return (
    <>
      <SplitView tabId={tabId} />
    </>
  );
}
