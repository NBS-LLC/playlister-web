import { config } from "../config";
import { AsyncObjectStorage } from "./AsyncObjectStorage";

export class CacheStats {
  constructor(private readonly storage: AsyncObjectStorage) {}

  async getNamespaceUsageInBytes(): Promise<number> {
    const keys = await this.storage.keys();
    const namespace = config.namespace;
    const namespaceKeys = keys.filter((key) => key.startsWith(namespace));

    let usage = 0;
    for (const key of namespaceKeys) {
      const item = await this.storage.getItem(key);
      usage += this.getItemSizeInBytes(key, item);
    }

    return usage;
  }

  async getAllUsageInBytes(): Promise<number> {
    const keys = await this.storage.keys();

    let usage = 0;
    for (const key of keys) {
      const item = await this.storage.getItem(key);
      usage += this.getItemSizeInBytes(key, item);
    }

    return usage;
  }

  async getNamespaceItemCount(): Promise<number> {
    const keys = await this.storage.keys();
    const namespace = config.namespace;
    const namespaceKeys = keys.filter((key) => key.startsWith(namespace));

    return namespaceKeys.length;
  }

  async getAllItemCount(): Promise<number> {
    const keys = await this.storage.keys();
    return keys.length;
  }

  private getItemSizeInBytes(key: string, value: unknown): number {
    const jsonString = JSON.stringify(value);
    return (
      new TextEncoder().encode(key).length +
      new TextEncoder().encode(jsonString).length
    );
  }
}
