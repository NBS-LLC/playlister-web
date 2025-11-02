/**
 * @jest-environment jsdom
 */

import {
  ElementNotFoundError,
  ParseTrackIdError,
  SpotifyWebPage,
} from "./SpotifyWebPage";

describe(SpotifyWebPage.name, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe(SpotifyWebPage.prototype.getNowPlayingTrackId.name, () => {
    it("returns the 'now playing' track id", () => {
      document.body.innerHTML = `
        <aside aria-label="Now playing view">
          <div><a href="/playlist/1111?uid=2222&uri=spotify:track:1234abcd">Example Track</a></div>
        </aside>
      `;

      const spotifyWebPage = new SpotifyWebPage();
      const trackId = spotifyWebPage.getNowPlayingTrackId();
      expect(trackId).toEqual("1234abcd");
    });

    it("throws an error when the element cannot be found", () => {
      document.body.innerHTML = `
        <aside aria-label="Now playing view">
          <div><a href="/playlist/1111?uid=2222&uri=spotify:episode:1234abcd">Example Episode</a></div>
        </aside>
      `;

      const spotifyWebPage = new SpotifyWebPage();
      expect(() => spotifyWebPage.getNowPlayingTrackId()).toThrow(
        ElementNotFoundError,
      );
    });

    it("throws an error when the track id is missing", () => {
      document.body.innerHTML = `
        <aside aria-label="Now playing view">
          <div><a href="/playlist/1111?uid=2222&uri=spotify:track:">Missing Track Id</a></div>
        </aside>
      `;

      const spotifyWebPage = new SpotifyWebPage();
      expect(() => spotifyWebPage.getNowPlayingTrackId()).toThrow(
        ParseTrackIdError,
      );
    });
  });

  describe(SpotifyWebPage.prototype.insertNowPlayingTrackStats.name, () => {
    it("enriches the 'now playing' track", () => {
      document.body.innerHTML = `
        <div id="parent">
          <div data-testid="context-item-info-title">Example Title</div>
        </div>
      `;

      const spotifyWebPage = new SpotifyWebPage();
      spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A");
      const parent = document.querySelector<HTMLDivElement>("#parent")!;
      expect(parent.textContent.trim()).toContain("168 | Dbm | 12A");
    });

    it("throws an error when the 'now playing' track cannot be found", () => {
      const spotifyWebPage = new SpotifyWebPage();

      expect(() =>
        spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A"),
      ).toThrow(ElementNotFoundError);
    });

    it("doesn't spam the enrichment data", () => {
      document.body.innerHTML = `
        <div id="parent">
          <div data-testid="context-item-info-title">Example Title</div>
        </div>
      `;

      // Try to insert the stats more than once.
      const spotifyWebPage = new SpotifyWebPage();
      spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A");
      spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A");

      const parent = document.querySelector<HTMLDivElement>("#parent")!;
      const content = parent.textContent.trim();
      const regex = new RegExp("168 \\| Dbm \\| 12A", "g");
      const matches = content.match(regex);
      expect(matches?.length).toBe(1);
    });
  });

  describe(SpotifyWebPage.prototype.insertTrackStats.name, () => {
    it("should insert track stats into the provided element", () => {
      const trackElem = document.createElement("a");
      const titleElem = document.createElement("div");
      titleElem.textContent = "Example Track";
      trackElem.append(titleElem);

      const spotifyWebPage = new SpotifyWebPage();
      spotifyWebPage.insertTrackStats(trackElem, "168 | Dbm | 12A");

      expect(trackElem.textContent).toContain("(168 | Dbm | 12A)");
      expect(trackElem.className).toContain("enriched");
    });

    it("should not insert stats if they are already present", () => {
      const trackElem = document.createElement("a");
      const titleElem = document.createElement("div");
      titleElem.textContent = "Example Track (168 | Dbm | 12A)";
      trackElem.append(titleElem);
      trackElem.className = "enriched";

      const spotifyWebPage = new SpotifyWebPage();
      spotifyWebPage.insertTrackStats(trackElem, "168 | Dbm | 12A");

      const content = trackElem.textContent.trim();
      const regex = new RegExp("168 \\| Dbm \\| 12A", "g");
      const matches = content.match(regex);
      expect(matches?.length).toBe(1);
    });
  });
});
