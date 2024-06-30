/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from "@jest/globals";
import { waitForElem } from "./html";

describe(waitForElem.name, () => {
  it("should resolve immediately if the element already exists", () => {
    const element = document.createElement("div");
    element.id = "unit-test";
    document.body.appendChild(element);
    return waitForElem("#unit-test");
  });

  it("should return the element when found", async () => {
    const element = document.createElement("div");
    element.id = "unit-test";
    document.body.appendChild(element);
    const result = await waitForElem("#unit-test");
    expect(result).toEqual(element);
  });

  it("should wait to resolve when the element is found", () => {
    const element = document.createElement("div");
    element.id = "unit-test";

    // const resultPromise = waitForElem("#unit-test");
  });
});
