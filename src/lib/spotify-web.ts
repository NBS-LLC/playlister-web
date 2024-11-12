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

/**
 * Finds an element in a list of elements that corresponds to a given track ID.
 *
 * @param elemTracks - An array of HTML elements.
 * @param trackId - The track ID to search for.
 * @return The element that corresponds to the given track ID, or undefined if not found.
 */
export function findTrackElementByTrackId(
  elemTracks: Element[],
  trackId: string,
) {
  return elemTracks.find((item) => {
    const elemTrackId = item.getAttribute("href")?.replace("/track/", "");
    return elemTrackId === trackId;
  });
}
