import { useState, useEffect, useRef } from 'react';
import { DEBOUNCE_MS } from '../constants/defaults';

export function useSearch(initialValue = ''): [string, (value: string) => void, () => void] {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(searchQuery);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchQuery]);

  const clear = () => {
    setSearchQuery('');
    setDebouncedValue('');
  };

  return [debouncedValue, setSearchQuery, clear];
}
