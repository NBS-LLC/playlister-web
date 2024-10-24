type MutationHandler = { (mutation: MutationRecord): Promise<void> };

/**
 * Waits for the specified element to be present in the DOM.
 *
 * @param selector - The CSS selector of the element to wait for.
 * @return A promise that resolves with the element once it is found.
 */
export function waitForElem(selector: string): Promise<Element> {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver((_mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Watches for mutations (changes) on a target element.
 *
 * @param targetElement - The element to observe mutations on.
 * @param callback - The function to call when a mutation is observed.
 * @param options - (Optional) The MutationObserverInit options.
 */
export function onMutation(
  targetElement: Element,
  callback: MutationHandler,
  options: MutationObserverInit = { attributes: true, childList: true },
) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      callback(mutation);
    }
  });

  observer.observe(targetElement, options);
}
