/**
 * @jest-environment jsdom
 */

import { TrackWithAudioFeatures } from "./spotify-api";
import {
  findTrackElementByTrackId,
  formatTrackDetails,
  getTrackIdsFromTrackElements,
  updateNowPlayingWidget,
} from "./spotify-web";

function createTestTrackWithAudioFeatures() {
  return {
    track: {
      id: "1234",
      name: "Track Name",
      artists: [{ name: "Artist Name" }],
    },
    audioFeatures: {
      id: "1234",
      key: 4,
      mode: 1,
      tempo: 120,
    },
  } as TrackWithAudioFeatures;
}

describe(formatTrackDetails.name, () => {
  it("should return the correct formatted track details", () => {
    const track = createTestTrackWithAudioFeatures();
    const expectedOutput = "Track Name (120 E 12B)";
    expect(formatTrackDetails(track.track.name, track)).toBe(expectedOutput);
  });
});

describe(getTrackIdsFromTrackElements.name, () => {
  it("should return track ids if they exist", () => {
    document.body.innerHTML = `
      <div class="track-list">
        <a href="/track/1111">track 1</a>
        <a href="/album/5555">album 1</a>
        <a href="/track/2222">track 2</a>
        <a name="more">more items</a>
        <a href="/track/3333">track 3</a>
        <a href="/track/4444">track 4</a>
      </div>
    `;

    const elements = document.querySelectorAll("a");

    const expectedTrackIds = ["1111", "2222", "3333", "4444"];
    expect(getTrackIdsFromTrackElements(Array.from(elements))).toEqual(
      expectedTrackIds,
    );
  });
});

describe(findTrackElementByTrackId.name, () => {
  it("should find a track element by its track id", () => {
    document.body.innerHTML = `
      <div class="track-list">
        <a href="/track/1111">track 1</a>
        <a href="/album/2222">album 1</a>
        <a href="/track/2222">track 2</a>
        <a name="more">more items</a>
        <a href="/track/3333">track 3</a>
        <a href="/track/4444">track 4</a>
      </div>
    `;

    const elements = document.querySelectorAll("a");

    const actual = findTrackElementByTrackId(Array.from(elements), "2222");
    expect(actual?.textContent).toEqual("track 2");
  });
});

describe(updateNowPlayingWidget.name, () => {
  it("should update the now playing widget with enhanced track details", () => {
    document.body.innerHTML = `
      <div>
        <a data-testid="context-item-link">Original Track Name</a>
      </div>
    `;

    const element = document.querySelector("div")!;
    updateNowPlayingWidget(element, createTestTrackWithAudioFeatures());

    const actual = document.querySelector("a");
    expect(actual?.textContent).toEqual("Track Name (120 E 12B)");
  });
});
