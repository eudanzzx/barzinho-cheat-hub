import { useState, useEffect, useRef } from 'react';

export const useThrottledDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (throttleRef.current) {
      clearTimeout(throttleRef.current);
    }

    throttleRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};