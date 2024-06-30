type MutationHandler = { (mutation: MutationRecord): Promise<void> };

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

export function onMutation(
  targetElement: Element,
  callback: MutationHandler,
  config = {
    attributes: true,
    childList: true,
  },
) {
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      callback(mutation);
    }
  });
  observer.observe(targetElement, config);
  return observer;
}
