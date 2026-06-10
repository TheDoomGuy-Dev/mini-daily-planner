import { useState, useCallback } from 'react';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/localStorage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => getStorageItem(key, initialValue));

  const setValue = useCallback(
    (value: T) => {
      setStoredValue(value);
      try {
        setStorageItem(key, value);
      } catch (e) {
        console.error(`Failed to save to localStorage key "${key}":`, e);
      }
    },
    [key],
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    removeStorageItem(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
