import { getCamelotValue, getKeyName } from "./audio";

import { AudioFeature, Track } from "./spotify-api";

export type TrackWithAudioFeatures = {
  track: Track;
  audioFeatures: AudioFeature;
};

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
