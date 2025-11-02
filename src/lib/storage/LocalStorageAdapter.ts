import { AsyncObjectStorage } from "./AsyncObjectStorage";

export class LocalStorageAdapter implements AsyncObjectStorage {
  constructor(private readonly storage: Storage) {}

  async getItem<T>(key: string): Promise<T | null> {
    const result = this.storage.getItem(key);
    if (!result) {
      return null;
    }

    try {
      return JSON.parse(result) as T;
    } catch {
      return result as unknown as T;
    }
  }

  async setItem<T>(key: string, value: T): Promise<T> {
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async keys(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      keys.push(this.storage.key(i)!);
    }
    return keys;
  }
}
