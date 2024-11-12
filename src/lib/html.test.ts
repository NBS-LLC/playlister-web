/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from "@jest/globals";
import { onMutation, waitForElem } from "./html";

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

  it("should wait to resolve until the element is found", () => {
    document.body.innerHTML = "<div id='content'></div>";

    const resultPromise = waitForElem("#unit-test").then((result) => {
      expect(result.id).toEqual("unit-test");
    });

    setTimeout(() => {
      const element = document.createElement("div");
      element.id = "unit-test";
      document.body.appendChild(element);
    }, 100);

    return resultPromise;
  });
});

describe(onMutation.name, () => {
  /**
   * Covers the use case of detecting when the now playing widget changes.
   */
  it("should invoke callback when an attribute mutation occurs", (done) => {
    document.body.innerHTML =
      "<div id='content' aria-label='unit-test-content'></div>";

    const elemContent = document.querySelector("#content")!;
    onMutation(elemContent, async () => {
      done();
    });

    setTimeout(() => {
      elemContent.setAttribute("aria-label", "changed");
    }, 100);
  });

  /**
   * Covers the use case of detecting when the playlist widget changes.
   */
  it("should invoke callback when a child mutation occurs", (done) => {
    document.body.innerHTML = "<div id='content'></div>";

    const elemContent = document.querySelector("#content")!;
    onMutation(elemContent, async () => {
      done();
    });

    setTimeout(() => {
      const element = document.createElement("div");
      element.id = "unit-test";
      elemContent.appendChild(element);
    }, 100);
  });

  /**
   * Covers the use case of tracks being added to a track list.
   */
  it("should invoke callback when a subtree mutation occurs", (done) => {
    document.body.innerHTML = "<div id='container'><div id='content'></div>";

    onMutation(
      document.querySelector("#container")!,
      async () => {
        done();
      },
      { childList: true, subtree: true },
    );

    setTimeout(() => {
      const element = document.createElement("div");
      element.id = "unit-test";
      document.querySelector("#content")!.appendChild(element);
    }, 100);
  });
});
