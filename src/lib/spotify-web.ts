import { getCamelotValue, getKeyName } from "./audio";
import { waitForElem } from "./html";

import { AudioFeature, PlaylistItem, Track } from "./spotify-api";

export type PlaylistItemWithAudioFeatures = {
  track: Track;
  audioFeatures: AudioFeature;
};

export type TrackWithAudioFeatures = PlaylistItemWithAudioFeatures;

type TracksWithAudioFeatures = Map<string, PlaylistItemWithAudioFeatures>;

/**
 * Provides a simple format for displaying track details.
 *
 * @param title - The track's title.
 * @param track - The track with audio features to format.
 * @return The formatted track details.
 */
export function formatTrackDetails(
  title: string,
  track: TrackWithAudioFeatures,
) {
  const trackKeyName = getKeyName(
    track.audioFeatures.key,
    track.audioFeatures.mode,
  );

  const trackCamelotValue = getCamelotValue(
    track.audioFeatures.key,
    track.audioFeatures.mode,
  );

  return `${title} (${track.audioFeatures.tempo} ${trackKeyName} ${trackCamelotValue})`;
}

export function updateNowPlayingWidget(
  elemNowPlayingWidget: Element,
  track: TrackWithAudioFeatures,
) {
  console.info(
    formatTrackDetails(
      `${track.track.name} by ${track.track.artists[0].name}`,
      track,
    ),
    track,
  );

  const elemCurrentTrackName = elemNowPlayingWidget.querySelector(
    'a[data-testid="context-item-link"]',
  );

  if (elemCurrentTrackName) {
    elemCurrentTrackName.textContent = formatTrackDetails(
      track.track.name,
      track,
    );
  }
}

export function updatePlaylistWidget(
  elemPlaylistWidget: Element,
  tracksWithAudioFeatures: TracksWithAudioFeatures,
) {
  const elemsTracks = elemPlaylistWidget.querySelectorAll(
    'a[data-testid="internal-track-link"]',
  );

  elemsTracks.forEach((elem) => {
    const trackId = elem.getAttribute("href")!.replace("/track/", "");

    if (tracksWithAudioFeatures.has(trackId)) {
      const track = tracksWithAudioFeatures.get(trackId)!;
      elem.textContent = formatTrackDetails(track.track.name, track);
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
