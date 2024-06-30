import { describe, expect, it } from "@jest/globals";
import { chunk } from "./array";

describe(chunk.name, () => {
  it("should return an empty array when given an empty array", () => {
    const input: number[] = [];
    const expected: number[][] = [];
    expect(chunk(input, 2)).toEqual(expected);
  });

  it("should return an array of arrays when given a non-empty array", () => {
    const input: number[] = [1, 2, 3, 4, 5, 6];
    const expected: number[][] = [
      [1, 2],
      [3, 4],
      [5, 6],
    ];
    expect(chunk(input, 2)).toEqual(expected);
  });

  it("should return an array of arrays with the specified chunk size", () => {
    const input: number[] = [1, 2, 3, 4, 5, 6];
    const chunkSize = 4;
    const expected: number[][] = [
      [1, 2, 3, 4],
      [5, 6],
    ];
    expect(chunk(input, chunkSize)).toEqual(expected);
  });
});
