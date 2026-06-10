import { useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        // Allow Escape in inputs
        if (e.key !== 'Escape') return;
      }

      const key = e.key.toLowerCase();

      // Ctrl+N for new task
      if (e.ctrlKey && key === 'n') {
        e.preventDefault();
        shortcuts['ctrl+n']?.();
        return;
      }

      // Number keys for navigation (1-4)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && ['1', '2', '3', '4'].includes(key)) {
        shortcuts[key]?.();
        return;
      }

      // Escape
      if (key === 'escape') {
        shortcuts['escape']?.();
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
