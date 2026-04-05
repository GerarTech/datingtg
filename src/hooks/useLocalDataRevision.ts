import { useEffect, useState } from 'react';

/** Bumps when localStorage-backed app data changes (admin saves, reports, etc.). */
export function useLocalDataRevision(): number {
  const [n, setN] = useState(0);
  useEffect(() => {
    const bump = () => setN((x) => x + 1);
    window.addEventListener('yene-local-data', bump);
    window.addEventListener('storage', bump);
    return () => {
      window.removeEventListener('yene-local-data', bump);
      window.removeEventListener('storage', bump);
    };
  }, []);
  return n;
}
