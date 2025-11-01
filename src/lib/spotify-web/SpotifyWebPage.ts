import { config } from "../config";

export class ElementNotFoundError extends Error {}
export class ParseTrackIdError extends Error {}

export class SpotifyWebPage {
  readonly nowPlayingTrack =
    'aside[aria-label="Now playing view"] a[href*="spotify:track:"]';

  readonly nowPlayingTitle = 'div[data-testid="context-item-info-title"]';

  readonly mainView = "#main-view";

  readonly trackLink = 'a[href^="/track/"]';

  static get namespace(): string {
    return config.appId ? `${config.appId}:` : "";
  }

  private get enrichedClassName() {
    return `${SpotifyWebPage.namespace}enriched`;
  }

  getNowPlayingTrackId() {
    const element = this.getElement<HTMLAnchorElement>(this.nowPlayingTrack);
    return this.parseNowPlayingTrackId(element);
  }

  insertNowPlayingTrackStats(stats: string) {
    const elements = this.getElements<HTMLDivElement>(this.nowPlayingTitle);
    elements.forEach((element) => {
      if (element.className.includes(this.enrichedClassName)) {
        return;
      }

      const div = document.createElement("div");
      div.textContent = stats;
      element.insertAdjacentElement("beforebegin", div);
      element.parentElement!.style.flexDirection = "column";
      element.className += ` ${this.enrichedClassName}`;
    });
  }

  insertTrackStats(element: HTMLAnchorElement, stats: string) {
    if (element.className.includes(this.enrichedClassName)) {
      return;
    }

    const titleElement = element.querySelector("div");
    titleElement!.textContent += ` (${stats})`;
    element.className += ` ${this.enrichedClassName}`;
  }

  private getElements<T extends HTMLElement>(selector: string): T[] {
    const elems = Array.from(document.querySelectorAll<T>(selector));
    if (!elems.length) {
      throw new ElementNotFoundError(`Unable to locate: ${selector}.`);
    }
    return elems;
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    return this.getElements<T>(selector)[0];
  }

  private parseNowPlayingTrackId(element: HTMLAnchorElement) {
    const url = new URLSearchParams(element.href);
    const uri = url.get("uri");

    const type = uri?.split(":")[1];
    const id = uri?.split(":")[2];

    if (type !== "track" || !id) {
      throw new ParseTrackIdError(`Unable to parse track id from: ${element}.`);
    }

    return id;
  }
}
