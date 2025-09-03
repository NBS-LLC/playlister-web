export class ElementNotFoundError extends Error {}
export class ParseTrackIdError extends Error {}

export class SpotifyWebPage {
  readonly nowPlayingTrack =
    'aside[aria-label="Now playing view"] a[href*="spotify:track:"]';

  readonly nowPlayingTitle = 'div[data-testid="context-item-info-title"]';

  getNowPlayingTrackId() {
    const element = this.getElement<HTMLAnchorElement>(this.nowPlayingTrack);
    return this.parseNowPlayingTrackId(element);
  }

  enrichNowPlayingTitle(tempo: number, key: string, camelot: string) {
    const elements = this.getElements<HTMLDivElement>(this.nowPlayingTitle);
    elements.forEach((element) => {
      element.textContent += ` (${tempo}|${key}|${camelot})`;
    });
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
