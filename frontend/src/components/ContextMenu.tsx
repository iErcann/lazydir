import { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type ContextMenuItem =
  | { kind: 'item'; label: string; onClick: () => void; disabled?: boolean }
  | { kind: 'separator' };

type ContextMenuProps = {
  children: ReactNode;
  items: ContextMenuItem[];
  onOpen?: () => void;
  onClose?: () => void;
};

export function ContextMenu({ children, items, onOpen, onClose }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  // Call onOpen/onClose when visibility changes
  useEffect(() => {
    if (visible) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [visible, onOpen, onClose]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  // Adjust menu position after it's rendered to prevent overflow
  useEffect(() => {
    if (visible && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = position;

      // Adjust X position if menu overflows right edge
      if (x + menuRect.width > viewportWidth) {
        x = Math.max(0, viewportWidth - menuRect.width - 5);
      }

      // Adjust Y position if menu overflows bottom edge
      if (y + menuRect.height > viewportHeight) {
        y = Math.max(0, viewportHeight - menuRect.height - 5);
      }

      // Update position if it changed
      if (x !== position.x || y !== position.y) {
        setPosition({ x, y });
      }
    }
  }, [visible, position]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      console.log('Document click detected');
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setVisible(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const menu = visible ? (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-50 bg-(--bg-secondary) text-(--text-primary) border border-(--bg-tertiary) rounded-md min-w-40"
    >
      {items.map((item, i) => {
        if (item.kind === 'separator') {
          // Render separator
          return <div key={i} className="my-1 border-t border-(--bg-tertiary)" />;
        }

        // Render normal item
        return (
          <div
            key={i}
            onClick={() => {
              if (item.disabled) return;
              item.onClick();
              setVisible(false);
            }}
            className={`
            w-full px-3 py-[2px]
            text-sm
            text-left
            cursor-pointer
            select-none
            whitespace-nowrap
            hover:bg-(--bg-primary)
            ${item.disabled ? 'opacity-50 pointer-events-none' : ''}
          `}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  ) : null;

  return (
    <div onContextMenu={handleContextMenu} className="inline-block">
      {children}
      {createPortal(menu, document.body)}
    </div>
  );
}
