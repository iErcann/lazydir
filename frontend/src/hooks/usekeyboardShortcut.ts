import { useEffect } from "react";

type Shortcut = {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  handler: () => void;
};

export function useKeyboardShortcut(shortcut: Shortcut) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      const ctrlPressed = shortcut.ctrl && (isMac ? e.metaKey : e.ctrlKey);
      const metaPressed = shortcut.meta && e.metaKey;
      const shiftPressed = shortcut.shift && e.shiftKey;
      const altPressed = shortcut.alt && e.altKey;

      if (
        e.key.toLowerCase() === shortcut.key.toLowerCase() &&
        (shortcut.ctrl ? ctrlPressed : true) &&
        (shortcut.meta ? metaPressed : true) &&
        (shortcut.shift ? shiftPressed : true) &&
        (shortcut.alt ? altPressed : true)
      ) {
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);
}
