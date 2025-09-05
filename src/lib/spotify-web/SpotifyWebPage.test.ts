/**
 * @jest-environment jsdom
 */

import { ElementNotFoundError, ParseTrackIdError, SpotifyWebPage } from ".";

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
        <div data-testid="context-item-info-title">Example Title</div>
      `;

      const spotifyWebPage = new SpotifyWebPage();
      spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A");
      const div = document.querySelector<HTMLDivElement>(
        ".playlister-web-enriched",
      );

      expect(div?.textContent.trim()).toEqual("168 | Dbm | 12A");
    });

    it("throws an error when the 'now playing' track cannot be found", () => {
      const spotifyWebPage = new SpotifyWebPage();

      expect(() =>
        spotifyWebPage.insertNowPlayingTrackStats("168 | Dbm | 12A"),
      ).toThrow(ElementNotFoundError);
    });
  });
});
