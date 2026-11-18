import AsyncStorage from '@react-native-async-storage/async-storage';

/** AsyncStorage wrapper that never throws (private mode, quota, etc.). */
export async function getJSON<T>(key: string): Promise<T | null> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export async function dropKey(key: string) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
