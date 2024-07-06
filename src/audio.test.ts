import { describe, expect, it } from "@jest/globals";
import { getKeyName } from "./audio";

describe("getKeyName", () => {
  it("should return the key name for a valid pitch class and mode", () => {
    expect(getKeyName(0, 1)).toEqual("C");
    expect(getKeyName(5, 1)).toEqual("F");
    expect(getKeyName(11, 0)).toEqual("Bm");
  });

  it("should return '?' for an invalid pitch class or mode", () => {
    expect(getKeyName(12, 1)).toEqual("?");
    expect(getKeyName(0, 2)).toEqual("?");
  });
});
