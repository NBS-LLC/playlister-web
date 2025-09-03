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

  enrichNowPlayingTitle(tempo: number) {
    const element = this.getElement<HTMLDivElement>(this.nowPlayingTitle);
    element.textContent += ` (${tempo})`;
  }

  private getElement<T extends HTMLElement>(selector: string): T {
    const elem = document.querySelector<T>(selector);

    if (!elem) {
      throw new ElementNotFoundError(`Unable to locate: ${selector}.`);
    }

    return elem;
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
