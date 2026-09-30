/** Tiny persisted settings store with a React hook. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type Settings = { country: string | null };

const KEY = 'settings';
let current: Settings = { country: null };
let ready = false;
const listeners = new Set<(s: Settings) => void>();

async function load() {
  if (ready) return;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) current = { ...current, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    // defaults
  }
  ready = true;
  listeners.forEach((l) => l(current));
}

export async function updateSettings(patch: Partial<Settings>) {
  current = { ...current, ...patch };
  listeners.forEach((l) => l(current));
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    // best-effort
  }
}

export function useSettings(): Settings {
  const [s, setS] = useState(current);
  useEffect(() => {
    listeners.add(setS);
    load();
    return () => {
      listeners.delete(setS);
    };
  }, []);
  return s;
}
