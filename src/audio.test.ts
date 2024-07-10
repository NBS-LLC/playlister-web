import { describe, expect, it } from "@jest/globals";
import { getCamelotName, getKeyName } from "./audio";

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

describe("getCamelotName", () => {
  it("should return the correct camelot name for a valid pitch class and mode", () => {
    expect(getCamelotName(0, 1)).toEqual("8B");
    expect(getCamelotName(5, 1)).toEqual("7B");
    expect(getCamelotName(11, 0)).toEqual("10A");
  });

  it("should return '?' for an invalid pitch class or mode", () => {
    expect(getCamelotName(12, 0)).toEqual("?");
    expect(getCamelotName(0, 2)).toEqual("?");
  });
});
