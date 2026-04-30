import { useState, useEffect, useRef } from 'react';

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * silence. Use it to avoid triggering expensive effects (I/O, API calls) on
 * every keystroke.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 500);
 *   useEffect(() => { expensiveSearch(debouncedQuery); }, [debouncedQuery]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/**
 * Returns a stable debounced callback that fires `delay` ms after the last call.
 * The callback ref is always up-to-date — no stale closure issues.
 *
 * Usage:
 *   const save = useDebouncedCallback((data) => localStorage.setItem(key, data), 500);
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  fnRef.current = fn;
  return useRef((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fnRef.current(...args), delay);
  }).current;
}
