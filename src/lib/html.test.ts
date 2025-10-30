/**
 * @jest-environment jsdom
 */

import { describe, expect, it } from "@jest/globals";
import { onMutation, waitForElem } from "./html";

describe(waitForElem.name, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

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
  let targetElement: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    targetElement = document.createElement("div");
    document.body.appendChild(targetElement);
  });

  it("fires when an attribute changes (default options)", (done) => {
    const callback = jest.fn();
    onMutation(targetElement, callback);

    targetElement.setAttribute("data-test", "value");

    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
      done();
    }, 0);
  });

  it("fires when a child is added (default options)", (done) => {
    const callback = jest.fn();
    onMutation(targetElement, callback);

    const newChild = document.createElement("span");
    targetElement.appendChild(newChild);

    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
      done();
    }, 0);
  });

  it("fires for subtree mutations when configured", (done) => {
    const childElement = document.createElement("span");
    targetElement.appendChild(childElement);

    const callback = jest.fn();
    onMutation(targetElement, callback, { subtree: true, childList: true });

    const newGrandchild = document.createElement("p");
    childElement.appendChild(newGrandchild);

    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
      done();
    }, 0);
  });

  it("does not fire for subtree mutations by default", (done) => {
    const childElement = document.createElement("span");
    targetElement.appendChild(childElement);

    const callback = jest.fn();
    // Default options: { attributes: true, childList: true }
    onMutation(targetElement, callback);

    const newGrandchild = document.createElement("p");
    childElement.appendChild(newGrandchild);

    setTimeout(() => {
      expect(callback).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it("fires for character data changes when configured", (done) => {
    targetElement.textContent = "initial";
    const callback = jest.fn();
    onMutation(targetElement, callback, { characterData: true, subtree: true });

    targetElement.firstChild!.textContent = "changed";

    setTimeout(() => {
      expect(callback).toHaveBeenCalled();
      const mutation = callback.mock.calls[0][0] as MutationRecord;
      expect(mutation.type).toBe("characterData");
      done();
    }, 0);
  });

  it("does not fire for character data changes by default", (done) => {
    targetElement.textContent = "initial";
    const callback = jest.fn();
    // Default options: { attributes: true, childList: true }
    onMutation(targetElement, callback);

    targetElement.firstChild!.textContent = "changed";

    setTimeout(() => {
      expect(callback).not.toHaveBeenCalled();
      done();
    }, 0);
  });

  it("supplies the correct mutation record", (done) => {
    const callback = jest.fn();
    onMutation(targetElement, callback, { attributes: true });

    targetElement.setAttribute("data-test", "new-value");

    setTimeout(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      const mutation = callback.mock.calls[0][0] as MutationRecord;
      expect(mutation.type).toBe("attributes");
      expect(mutation.attributeName).toBe("data-test");
      done();
    }, 0);
  });
});
