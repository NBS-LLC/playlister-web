import { getCamelotValue, getKeyName } from "./audio";
import { TrackWithAudioFeatures } from "./spotify-api";

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

/**
 * Extracts track IDs from a list of elements.
 *
 * @param elements - An array of HTML elements.
 * @return An array of track IDs.
 */
export function getTrackIdsFromTrackElements(elements: Element[]) {
  return elements
    .map((elemTrack) => {
      const href = elemTrack.getAttribute("href");
      return href && href.includes("/track/") ? href.split("/track/")[1] : null;
    })
    .filter((trackId) => trackId !== null);
}
