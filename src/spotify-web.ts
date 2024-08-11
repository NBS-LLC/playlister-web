import { getCamelotValue, getKeyName } from "./audio";
import { waitForElem } from "./html";

import {
  AudioFeature,
  PlaylistItem,
  Track,
  getAccessToken,
  getCurrentlyPlayingTrack,
  getTrackAudioFeatures,
} from "./spotify-api";

export type PlaylistItemWithAudioFeatures = {
  track: Track;
  audioFeatures: AudioFeature;
};

type TracksWithAudioFeatures = Map<string, PlaylistItemWithAudioFeatures>;

/**
 * Formats the track details including title, key name, and camelot value.
 *
 * @param track - The playlist item with audio features to format.
 * @return The formatted track details as a string.
 */
export function formatTrackDetails(track: PlaylistItemWithAudioFeatures) {
  const trackTitle = `${track.track.name} by ${track.track.artists[0].name}`;

  const trackKeyName = getKeyName(
    track.audioFeatures.key,
    track.audioFeatures.mode,
  );

  const trackCamelotValue = getCamelotValue(
    track.audioFeatures.key,
    track.audioFeatures.mode,
  );

  return `${trackTitle} (${track.audioFeatures.tempo} ${trackKeyName} ${trackCamelotValue})`;
}

export async function updateNowPlayingWidget(elemNowPlayingWidget: Element) {
  const accessToken = await getAccessToken();
  const currentTrack = await getCurrentlyPlayingTrack(accessToken);
  const trackAudioFeatures = await getTrackAudioFeatures(
    accessToken,
    currentTrack.id,
  );

  console.log(
    formatTrackDetails({
      track: currentTrack,
      audioFeatures: trackAudioFeatures,
    }),
  );

  const elemCurrentTrackName = elemNowPlayingWidget.querySelector(
    'a[data-testid="context-item-link"]',
  );

  if (elemCurrentTrackName) {
    elemCurrentTrackName.textContent =
      currentTrack.name + " (" + trackAudioFeatures.tempo + ")";
  }
}

export async function updatePlaylistWidget(
  elemPlaylistWidget: Element,
  tracksWithAudioFeatures: TracksWithAudioFeatures,
) {
  const elemsTracks = elemPlaylistWidget.querySelectorAll(
    'a[data-testid="internal-track-link"]',
  );

  elemsTracks.forEach((elem) => {
    const trackId = elem.getAttribute("href")!.replace("/track/", "");

    if (tracksWithAudioFeatures.has(trackId)) {
      const audioFeatures = tracksWithAudioFeatures.get(trackId)!;
      elem.textContent = formatTrackDetails({
        track: audioFeatures.track,
        audioFeatures: audioFeatures.audioFeatures,
      });
    }
  });
}

export function getPlaylistContainer(elemPlaylistWidget: Element) {
  return elemPlaylistWidget.querySelector(
    '[role="presentation"]:nth-child(2) > [role="presentation"]:nth-child(2)',
  );
}

export async function getPlaylistId() {
  const elemPlaylistPage = await waitForElem('[data-testid="playlist-page"]');

  if (!elemPlaylistPage.hasAttribute("data-test-uri")) {
    throw new Error("unable to locate playlist id");
  }

  return elemPlaylistPage
    .getAttribute("data-test-uri")!
    .replace("spotify:playlist:", "");
}

export function combinePlaylistItemsWithAudioFeatures(
  playlistItems: PlaylistItem[],
  audioFeatures: AudioFeature[],
) {
  const trackMap: TracksWithAudioFeatures = new Map();

  playlistItems.forEach((item) => {
    trackMap.set(item.track.id, {
      track: item.track,
      audioFeatures: audioFeatures.find(
        (feature) => feature.id === item.track.id,
      )!,
    });
  });

  return trackMap;
}
