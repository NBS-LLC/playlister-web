/**
 * @jest-environment jsdom
 */

import { SpotifyWebPage } from ".";
import { waitForElem } from "../html";

jest.mock("../html");
const mockWaitForElem = waitForElem as jest.Mock;

describe(SpotifyWebPage.name, () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    jest.clearAllMocks();
  });

  describe(SpotifyWebPage.prototype.getNowPlayingTrackElement.name, () => {
    it("returns the 'now playing' track element", async () => {
      const mockElement = document.createElement("a");
      mockElement.href = "/playlist/1111?uid=2222&uri=spotify:track:1234abcd";
      mockWaitForElem.mockResolvedValue(mockElement);

      const page = new SpotifyWebPage();
      const element = await page.getNowPlayingTrackElement();

      expect(mockWaitForElem).toHaveBeenCalledTimes(1);
      expect(element).toEqual(mockElement);
    });
  });

  describe(SpotifyWebPage.prototype.getNowPlayingTrackId.name, () => {
    it("returns the 'now playing' track id", async () => {
      const mockElement = document.createElement("a");
      mockElement.href = "/playlist/1111?uid=2222&uri=spotify:track:1234abcd";
      mockWaitForElem.mockResolvedValue(mockElement);

      const page = new SpotifyWebPage();
      const trackId = await page.getNowPlayingTrackId();

      expect(mockWaitForElem).toHaveBeenCalledTimes(1);
      expect(trackId).toEqual("1234abcd");
    });
  });
});
