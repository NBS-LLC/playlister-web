import { AsyncObjectStorage } from "./AsyncObjectStorage";

export class LocalStorageAdapter implements AsyncObjectStorage {
  private data: Map<string, string> = new Map();

  constructor(private readonly storage: Storage) {}

  static async create() {
    const lsa = new LocalStorageAdapter(localStorage);
    await lsa.init();
    return lsa;
  }

  async init(): Promise<void> {
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (!key) {
        continue;
      }

      const value = this.storage.getItem(key);
      if (!value) {
        continue;
      }

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
    this.data.delete(key);
    this.storage.removeItem(key);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.data.keys());
  }
}
