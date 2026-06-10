/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react';

// Module-level ref object (not a component, so no rule violation)
const announceRef: { current: ((message: string) => void) | null } = { current: null };

export function announce(message: string) {
  if (announceRef.current) {
    announceRef.current(message);
  }
}

export default function ScreenReaderAnnouncement() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState(0);

  const announceFn = useCallback((msg: string) => {
    setMessage(msg);
    setKey((k) => k + 1);
  }, []);

  useEffect(() => {
    announceRef.current = announceFn;
    return () => {
      announceRef.current = null;
    };
  }, [announceFn]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, key]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      key={key}
    >
      {message}
    </div>
  );
}
