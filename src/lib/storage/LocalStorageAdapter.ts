import { AsyncObjectStorage } from "./AsyncObjectStorage";

export class LocalStorageAdapter implements AsyncObjectStorage {
  private data: Map<string, string | null> = new Map();

  constructor(private readonly storage: Storage) {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i)!;
      const value = this.storage.getItem(key);
      this.data.set(key, value);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    const result = this.data.get(key);
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
    const jsonItem = JSON.stringify(value);
    this.data.set(key, jsonItem);
    this.storage.setItem(key, jsonItem);
    return value;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }
}
