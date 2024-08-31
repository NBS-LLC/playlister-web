import { describe, expect, it } from "@jest/globals";
import { getCamelotValue, getKeyName } from "./audio";

describe(getKeyName.name, () => {
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

describe(getCamelotValue.name, () => {
  it("should return the correct camelot value for a valid pitch class and mode", () => {
    expect(getCamelotValue(0, 1)).toEqual("8B");
    expect(getCamelotValue(5, 1)).toEqual("7B");
    expect(getCamelotValue(11, 0)).toEqual("10A");
  });

  it("should return '?' for an invalid pitch class or mode", () => {
    expect(getCamelotValue(12, 0)).toEqual("?");
    expect(getCamelotValue(0, 2)).toEqual("?");
  });
});
