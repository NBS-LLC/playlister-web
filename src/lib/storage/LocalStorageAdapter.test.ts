/**
 * @jest-environment jsdom
 */

import { LocalStorageAdapter } from "./LocalStorageAdapter";

describe(LocalStorageAdapter.name, () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter(localStorage);
  });

  describe("create", () => {
    it("initializes and returns a new adapter", async () => {
      localStorage.setItem("a", "apple");
      localStorage.setItem("b", "banana");
      localStorage.setItem("c", "cherry");

      const lsa = await LocalStorageAdapter.create();
      localStorage.clear();

      expect(await lsa.keys()).toHaveLength(3);
    });
  });

  describe(LocalStorageAdapter.prototype.refresh.name, () => {
    it("reads local storage into memory", async () => {
      localStorage.setItem("a", "apple");
      localStorage.setItem("b", "banana");
      localStorage.setItem("c", "cherry");

      const lsa = new LocalStorageAdapter(localStorage);
      expect(await lsa.keys()).toHaveLength(0);
      await lsa.refresh();
      expect(await lsa.keys()).toHaveLength(3);

      localStorage.clear();

      // Items should remain in the adapter's memory.
      expect(await lsa.getItem("a")).toEqual("apple");
      expect(await lsa.getItem("b")).toEqual("banana");
      expect(await lsa.getItem("c")).toEqual("cherry");
    });

    it("handles external changes gracefully", async () => {
      localStorage.setItem("a", "apple");
      localStorage.setItem("b", "banana");
      localStorage.setItem("c", "cherry");
      const lsa = new LocalStorageAdapter(localStorage);

      jest.spyOn(Storage.prototype, "key").mockReturnValueOnce(null);
      await lsa.refresh();

      expect(await lsa.keys()).toHaveLength(2);
      expect(await lsa.getItem("b")).toEqual("banana");
      expect(await lsa.getItem("c")).toEqual("cherry");

      jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(null);
      await lsa.refresh();

      expect(await lsa.keys()).toHaveLength(2);
      expect(await lsa.getItem("b")).toEqual("banana");
      expect(await lsa.getItem("c")).toEqual("cherry");
    });
  });

  describe(LocalStorageAdapter.prototype.getItem.name, () => {
    it("returns a stored object with the correct type", async () => {
      const data = { person: "tester" };
      adapter.setItem("unittest", data);

      const result = await adapter.getItem<typeof data>("unittest");
      expect(result?.person).toEqual("tester");
    });

    it("returns raw string if it cannot be parsed as JSON", async () => {
      const rawString = "this is not json";
      adapter.setItem("unittest", rawString);

      const result = await adapter.getItem<string>("unittest");
      expect(result).toBe(rawString);
    });

    it("returns null for unknown keys", async () => {
      expect(await adapter.getItem("bogus")).toBeNull();
    });
  });

  describe(LocalStorageAdapter.prototype.removeItem.name, () => {
    it("removes a known object by key", async () => {
      const data = { person: "tester" };
      await adapter.setItem("unittest", data);
      await adapter.removeItem("unittest");

      expect(localStorage.getItem("unittest")).toBeNull();
    });

    it("returns gracefully when trying to remove an unknown key", async () => {
      localStorage.setItem("unittest", "other data");
      await adapter.removeItem("bogus");

      // Exiting data should remain unaffected.
      const result = localStorage.getItem("unittest");
      expect(result).not.toBeNull();
      expect(result).toEqual("other data");
    });

    it("keeps local storage and internal memory in sync", async () => {
      const data = { person: "tester" };
      await adapter.setItem("unittest", data);
      await adapter.removeItem("unittest");

      expect(await adapter.getItem("unittest")).toBeNull();
      expect(localStorage.getItem("unittest")).toBeNull();
    });
  });

  describe(LocalStorageAdapter.prototype.setItem.name, () => {
    it("serializes and stores an object by key", async () => {
      const data = { person: "tester" };
      await adapter.setItem("unittest", data);

      const result = localStorage.getItem("unittest");
      expect(result).not.toBeNull();
      expect(result).toEqual(JSON.stringify(data));
    });

    it("returns the object stored", async () => {
      const data = { person: "tester" };
      const result = await adapter.setItem("unittest", data);

      expect(result).toEqual(data);
    });

    it("overwrites an existing object with the same key", async () => {
      const data = { person: "tester" };
      await adapter.setItem("unittest", data);

      const replacement = { address: "1234 test st" };
      await adapter.setItem("unittest", replacement);

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

    it("keeps local storage and internal memory in sync", async () => {
      const data = { person: "tester" };
      await adapter.setItem("unittest", data);

      const localItem = localStorage.getItem("unittest");
      expect(localItem).not.toBeNull();
      localStorage.clear();
      expect(localStorage.getItem("unittest")).toBeNull();

      const internalItem = await adapter.getItem("unittest");
      expect(internalItem).not.toBeNull();
      expect(internalItem).toEqual(JSON.parse(localItem!));
    });
  });

  describe(LocalStorageAdapter.prototype.keys.name, () => {
    it("returns all keys in the storage", async () => {
      adapter.setItem("key1", "value1");
      adapter.setItem("key2", "value2");

      const keys = await adapter.keys();
      expect(keys).toHaveLength(2);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
    });

    it("returns an empty array when storage is empty", async () => {
      const keys = await adapter.keys();
      expect(keys).toHaveLength(0);
    });
  });
});
