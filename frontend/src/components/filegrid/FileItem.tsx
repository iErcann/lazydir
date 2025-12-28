import { Folder } from "lucide-react";
import { getIconForFile } from "@react-symbols/icons/utils";
import { FileInfo } from "../../../bindings/lazydir/internal";
import { ContextMenu } from "../ContextMenu";
import { useFileContextMenu } from "../../hooks/useFileContextMenu";
import { useTabsStore } from "../../store/tabsStore";
import { Pane, Tab } from "../../types";

interface FileItemProps {
  file: FileInfo;
  onDirectoryOpen: (file: FileInfo) => void;
  onFileOpen: (file: FileInfo) => void;
  onClick?: (file: FileInfo, e: React.MouseEvent) => void;
  paneId: string;
  tabId: string;
}

export function FileItem({
  file,
  onDirectoryOpen,
  onFileOpen,
  onClick,
  paneId,
  tabId,
}: FileItemProps) {
  const onOpen = (file: FileInfo) => {
    if (file.isDir) {
      onDirectoryOpen(file);
    } else {
      onFileOpen(file);
    }
  };

  const selectedFilePaths = useTabsStore(
    (state) => state.getPane(tabId, paneId)?.selectedFilePaths
  );

  const isSelected = selectedFilePaths?.has(file.path);

  const { contextMenuItems, handleContextOpen } = useFileContextMenu({
    file,
    selectedFilePaths,
    onOpen,
  });

  const content = (
    <div
      onDoubleClick={() => onOpen(file)}
      onClick={(e) => onClick?.(file, e)}
      className={`flex flex-col items-center rounded-lg select-none p-4  w-24  ${
        isSelected ? "bg-(--bg-tertiary)" : "hover:bg-(--bg-tertiary)"
      }`}
      title={file.name}
    >
      {file.isDir ? (
        <div className="text-(--accent) mb-2 ">
          <Folder className="w-16 h-16 fill-(--accent)" />
        </div>
      ) : (
        getIconForFile({
          fileName: `${file.name}`,
          className: "w-16 h-16 text-(--accent) mb-2 ",
        })
      )}

      <span className="text-xs text-center text-(--text-primary) w-full wrap-break-word line-clamp-2 ">
        {file.name}
      </span>
    </div>
  );

  // If context menu items are provided, wrap in ContextMenu
  if (contextMenuItems) {
    return (
      <ContextMenu onOpen={handleContextOpen} items={contextMenuItems}>
        {content}
      </ContextMenu>
    );
  }

  return content;
}
