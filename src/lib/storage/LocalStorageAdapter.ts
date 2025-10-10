import { AsyncObjectStorage } from "./AsyncObjectStorage";

export class LocalStorageAdapter implements AsyncObjectStorage {
  constructor(private readonly storage: Storage) {}

  async getItem<T>(key: string): Promise<T | null> {
    const result = this.storage.getItem(key);
    return result && JSON.parse(result);
  }

  async setItem<T>(key: string, value: T): Promise<T> {
    this.storage.setItem(key, JSON.stringify(value));
    return value;
  }

  async removeItem(key: string): Promise<void> {
    this.storage.removeItem(key);
  }
}
