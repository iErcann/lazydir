import { Folder } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useFileSystemStore } from '../store/directoryStore';
import { useTabsStore } from '../store/tabsStore';
import { OperatingSystem } from '../../bindings/lazydir/internal';

export function Sidebar() {
  const getShortcuts = useFileSystemStore((s) => s.getShortcuts);
  const operatingSystem = useFileSystemStore((s) => s.operatingSystem);

  const updatePanePath = useTabsStore((s) => s.updatePanePath);
  const getActivePane = useTabsStore((s) => s.getActivePane);
  const activePanePath = useTabsStore((s) => s.getActivePane()?.pane.path);

  const { data: shortcuts, error } = useQuery({
    queryKey: ['sidebarShortcuts'],
    queryFn: () => {
      console.log('Sidebar: Loading shortcuts');
      return getShortcuts();
    },
    select: (result) => {
      if (result.error) throw result.error;
      return result.data;
    },
  });

  if (error) {
    return (
      <aside className="max-w-48 bg-(--bg-secondary) hidden sm:flex p-3">
        <p className="text-xs text-red-500">Error loading shortcuts</p>
      </aside>
    );
  }

  const onShortcutClick = (path: string) => {
    const activePane = getActivePane();
    if (activePane) {
      updatePanePath(activePane.tab.id, activePane.pane.id, path);
    }
  };

  return (
    <aside className="max-w-48 bg-(--bg-secondary) hidden sm:flex flex-col">
      <div className={`p-3 ${operatingSystem === OperatingSystem.OSMac ? 'pt-8' : ''}`}>
        <h2 className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wider px-2 mb-2">
          lazydir
        </h2>

        <div className="space-y-0.5">
          {shortcuts?.map((shortcut) => {
            const isCurrentPath = activePanePath === shortcut.path;

            return (
              <button
                key={shortcut.path}
                onClick={() => onShortcutClick(shortcut.path)}
                className={`
                  w-full flex items-center gap-2
                  px-2 py-1.5 rounded-md text-sm
                  active:bg-(--bg-accent)
                  active:text-(--text-primary)

                  ${
                    isCurrentPath
                      ? 'bg-(--bg-tertiary) font-medium text-(--text-primary)'
                      : 'text-(--text-secondary)'
                  }
                `}
              >
                <div className="text-(--accent)">
                  <Folder className="w-5 h-5 fill-(--accent)" />
                </div>

                <span className="truncate">{shortcut.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
