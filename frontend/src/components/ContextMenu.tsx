import { useState, useEffect, useRef, ReactNode } from "react";
import { createPortal } from "react-dom";

export type ContextMenuItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type ContextMenuProps = {
  children: ReactNode;
  items: ContextMenuItem[];
  onOpen?: () => void;
  onClose?: () => void;
};

export function ContextMenu({
  children,
  items,
  onOpen,
  onClose,
}: ContextMenuProps) {
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      console.log("Document click detected");
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVisible(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const menu = visible ? (
    <div
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      className="fixed z-50 bg-(--bg-primary) text-(--text-primary) border border-(--bg-tertiary) rounded-md shadow-lg min-w-40"
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => {
            if (item.disabled) return;
            item.onClick();
            setVisible(false);
          }}
          className={`w-full px-3 py-1 text-left cursor-pointer select-none rounded-sm
            hover:bg-(--bg-secondary) ${
              item.disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
        >
          {item.label}
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div onContextMenu={handleContextMenu} className="inline-block">
      {children}
      {createPortal(menu, document.body)}
    </div>
  );
}
