import { ViewMode, type Pane, type Tab } from '../types';
import { useFileSystemStore } from '../store/directoryStore';
import { useEffect, useState } from 'react';
import { useTabsStore } from '../store/tabsStore';
import { PathBar } from './PathBar';
import { StatusBar } from './StatusBar';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { List, Grid } from 'lucide-react';
import { FileGrid } from './filegrid/FileGrid';
import { FileList } from './filelist/FileList';
import { FileInfo } from '../../bindings/lazydir/internal';

interface FileManagerPaneProps {
  tabId: string;
  paneId: string;
}
export function FileManagerPane({ tabId, paneId }: FileManagerPaneProps) {
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);

  // FileSystem actions
  const loadDirectory = useFileSystemStore((state) => state.listDirectory);
  const getPathInfo = useFileSystemStore((state) => state.getPathInfo);
  const getPathAtIndex = useFileSystemStore((state) => state.getPathAtIndex);
  const openFileWithDefaultApp = useFileSystemStore((state) => state.openFileWithDefaultApp);

  // Tabs/navigation actions
  const panePath = useTabsStore((state) => state.getPane(tabId, paneId)?.path);
  const viewMode = useTabsStore((state) => state.getPane(tabId, paneId)?.viewMode);
  const historyIndex = useTabsStore((state) => state.getPane(tabId, paneId)?.historyIndex);
  const historyLength = useTabsStore((state) => state.getPane(tabId, paneId)?.history.length);

  const updatePanePath = useTabsStore((state) => state.updatePanePath);
  const activatePane = useTabsStore((state) => state.activatePane);
  const paneNavigateBack = useTabsStore((state) => state.paneNavigateBack);
  const paneNavigateForward = useTabsStore((state) => state.paneNavigateForward);
  const setPaneViewMode = useTabsStore((state) => state.setPaneViewMode);
  const setPaneStatus = useTabsStore((state) => state.setPaneStatus);
  const showErrorDialog = useFileSystemStore((state) => state.showErrorDialog);
  // Query directory contents on pane path change
  const {
    data: contents,
    isLoading,
    error: loadDirectoryError,
    isFetching,
  } = useQuery({
    queryKey: ['directory', panePath, loadDirectory],
    queryFn: () => {
      console.log('FileManagerPane: Loading directory for path', panePath);
      return loadDirectory(panePath!);
    },
    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
    retry: false,
    refetchOnWindowFocus: false, // otherwise it will refetch on alt tab.
    refetchOnMount: false,
    staleTime: 0,
    gcTime: 0,
  });

  // Catch file open errors and show dialog
  useEffect(() => {
    if (!fileOpenError && !loadDirectoryError) return;

    showErrorDialog('Error', fileOpenError ?? loadDirectoryError?.message ?? 'Unknown error');

    setFileOpenError(null);
  }, [fileOpenError, loadDirectoryError]);

  const handleDirectoryOpen = (file: FileInfo) => {
    if (!file.isDir) return;
    handlePathChange(file.path);
  };

  const handlePathChange = (newPath: string) => {
    updatePanePath(tabId, paneId, newPath);
    setPaneStatus(tabId, paneId); // Clear status on navigation
  };

  const handleFileOpen = async (file: FileInfo) => {
    if (file.isDir) return;
    const opened = await openFileWithDefaultApp(file.path);
    if (opened.error) setFileOpenError(opened.error.message);
  };

  const handlePaneClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    activatePane(tabId, paneId);
  };

  const canGoBack = historyIndex! > 0;
  const canGoForward = historyIndex! < historyLength! - 1;

  const handleNavigateUp = () => {
    getPathInfo(panePath!).then((result) => {
      if (result.error || !result.data) return;
      const pathInfo = result.data;
      const parentIndex = pathInfo.parts.length - 2;
      if (parentIndex < 0) return;

      getPathAtIndex(pathInfo.fullPath, parentIndex).then((res) => {
        if (res.error || !res.data) return;
        handlePathChange(res.data);
      });
    });
  };

  return (
    <div className="grid grid-rows-[auto_1fr] h-full" onClick={handlePaneClick}>
      {/* Top Bar */}
      <div className="grid grid-cols-[auto_auto_auto_1fr_auto] items-center gap-1 px-2 py-1 bg-(--bg-primary) text-(--text-primary)">
        {/* Navigation Buttons */}
        <button
          className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
          disabled={!canGoBack}
          onClick={() => paneNavigateBack(tabId, paneId)}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-(--bg-secondary) disabled:opacity-40 transition"
          disabled={!canGoForward}
          onClick={() => paneNavigateForward(tabId, paneId)}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          className="p-1 rounded hover:bg-(--bg-secondary) transition"
          onClick={handleNavigateUp}
        >
          <ArrowUp className="w-4 h-4" />
        </button>

        {/* Path Bar */}
        <div className="mx-1 min-w-0 overflow-hidden">
          <PathBar paneId={paneId} tabId={tabId} onPathChange={handlePathChange} />
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            className={`p-1 rounded hover:bg-(--bg-secondary) transition ${
              viewMode === ViewMode.LIST ? 'bg-(--bg-accent)' : ''
            }`}
            onClick={() => setPaneViewMode(tabId, paneId, ViewMode.LIST)}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            className={`p-1 rounded hover:bg-(--bg-secondary) transition ${
              viewMode === ViewMode.GRID ? 'bg-(--bg-accent)' : ''
            }`}
            onClick={() => setPaneViewMode(tabId, paneId, ViewMode.GRID)}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative overflow-hidden px-2 h-full">
        <div className="h-full overflow-auto pb-8">
          {(fileOpenError || loadDirectoryError) && (
            <div className="p-2 bg-(--bg-tertiary) text-(--text-primary) rounded-md">
              Error: {fileOpenError || loadDirectoryError?.message}
            </div>
          )}

          {(isLoading || isFetching) && <div className="p-1 text-(--text-secondary)"> </div>}

          {contents && !(fileOpenError || loadDirectoryError) && (
            <>
              {viewMode === ViewMode.GRID ? (
                <FileGrid
                  contents={contents}
                  onDirectoryOpen={handleDirectoryOpen}
                  onFileOpen={handleFileOpen}
                  paneId={paneId}
                  tabId={tabId}
                />
              ) : (
                <FileList
                  contents={contents}
                  onDirectoryOpen={handleDirectoryOpen}
                  onFileOpen={handleFileOpen}
                  paneId={paneId}
                  tabId={tabId}
                />
              )}
              <StatusBar tabId={tabId} paneId={paneId} contents={contents} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
