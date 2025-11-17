/**
 * @jest-environment jsdom
 */

import { LocalStorageAdapter } from "./LocalStorageAdapter";

describe(LocalStorageAdapter.name, () => {
  let storage: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    storage = new LocalStorageAdapter(localStorage);
  });

  describe("constructor", () => {
    it("reads local storage into memory", async () => {
      localStorage.setItem("a", "apple");
      localStorage.setItem("b", "banana");
      localStorage.setItem("c", "cherry");

      const lsa = new LocalStorageAdapter(localStorage);
      localStorage.clear();
      
      expect(await lsa.keys()).toHaveLength(3);
      expect(await lsa.getItem("a")).toEqual("apple");
      expect(await lsa.getItem("b")).toEqual("banana");
      expect(await lsa.getItem("c")).toEqual("cherry");
    });
  });

  describe(LocalStorageAdapter.prototype.getItem.name, () => {
    it("returns a stored object with the correct type", async () => {
      const data = { person: "tester" };
      localStorage.setItem("unittest", JSON.stringify(data));
      const result: typeof data | null = await storage.getItem("unittest");

      expect(result).not.toBeNull();
      expect(result).toEqual(data);
    });

    it("returns raw string if it cannot be parsed as JSON", async () => {
      const rawString = "this is not json";
      localStorage.setItem("unittest", rawString);
      const result: string | null = await storage.getItem("unittest");

      expect(result).not.toBeNull();
      expect(result).toBe(rawString);
    });

    it("returns null for unknown keys", async () => {
      expect(await storage.getItem("bogus")).toBeNull();
    });
  });

  describe(LocalStorageAdapter.prototype.removeItem.name, () => {
    it("removes a known object by key", async () => {
      const data = { person: "tester" };
      localStorage.setItem("unittest", JSON.stringify(data));
      await storage.removeItem("unittest");

      expect(localStorage.getItem("unittest")).toBeNull();
    });

    it("returns gracefully when trying to remove an unknown key", async () => {
      const data = { person: "tester" };
      localStorage.setItem("unittest", JSON.stringify(data));
      await storage.removeItem("bogus");

      // Exiting data should remain unaffected.
      const result = localStorage.getItem("unittest");
      expect(result).not.toBeNull();
      expect(result).toEqual(JSON.stringify(data));
    });
  });

  describe(LocalStorageAdapter.prototype.setItem.name, () => {
    it("serializes and stores an object by key", async () => {
      const data = { person: "tester" };
      await storage.setItem("unittest", data);

      const result = localStorage.getItem("unittest");
      expect(result).not.toBeNull();
      expect(result).toEqual(JSON.stringify(data));
    });

    it("returns the object stored", async () => {
      const data = { person: "tester" };
      const result = await storage.setItem("unittest", data);

      expect(result).toEqual(data);
    });

    it("overwrites an existing object with the same key", async () => {
      const data = { person: "tester" };
      localStorage.setItem("unittest", JSON.stringify(data));

      const replacement = { address: "1234 test st" };
      await storage.setItem("unittest", replacement);

      const result = localStorage.getItem("unittest");
      expect(result).not.toBeNull();
      expect(result).toEqual(JSON.stringify(replacement));
    });

    it("bubbles up errors", async () => {
      const mockLocalStorage = {
        setItem: jest.fn(() => {
          throw new DOMException();
        }),
        getItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
        key: jest.fn(),
        length: 0,
      };

      const adapter = new LocalStorageAdapter(mockLocalStorage);

      await expect(adapter.setItem("key", "value")).rejects.toThrow(
        DOMException,
      );
    });
  });

  describe(LocalStorageAdapter.prototype.keys.name, () => {
    it("returns all keys in the storage", async () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");

      const keys = await storage.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });

    it("returns an empty array when storage is empty", async () => {
      const keys = await storage.keys();
      expect(keys).toHaveLength(0);
    });
  });
});
