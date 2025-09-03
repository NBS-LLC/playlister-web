import { waitForElem } from "../html";

export class ParseTrackIdError extends Error {}

export class SpotifyWebPage {
  async getNowPlayingTrackElement() {
    return waitForElem(
      'aside[aria-label="Now playing view"] a[href*="spotify:track:"]',
    ) as Promise<HTMLAnchorElement>;
  }

  async getNowPlayingTrackId() {
    const element = await this.getNowPlayingTrackElement();
    return this.parseNowPlayingHref(element);
  }

  private parseNowPlayingHref(element: HTMLAnchorElement) {
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
