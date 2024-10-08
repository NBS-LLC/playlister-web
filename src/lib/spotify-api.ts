import { chunk } from "./array";
import { fetchAllData } from "./http";
import { measurePerformance } from "./perf";

export type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
};

export type PlaylistItem = {
  track: Track;
};

export type AudioFeature = {
  id: string;
  key: number;
  mode: number;
  tempo: number;
};

/**
 * Assumes the user is logged into Spotify (uses auth from cookies).
 */
export async function getAccessToken() {
  const tokenResponse = await fetch(
    "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
  );

  return (await tokenResponse.json()).accessToken as string;
}

export async function getCurrentlyPlayingTrack(accessToken: string) {
  const currentTrackResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  try {
    return (await currentTrackResponse.json()).item as Track;
  } catch (error) {
    throw new Error("Unable to get currently playing track.", { cause: error });
  }
}

export async function getTrackAudioFeatures(
  accessToken: string,
  trackId: string,
) {
  const trackAudioFeaturesResponse = await fetch(
    "https://api.spotify.com/v1/audio-features/" + trackId,
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return (await trackAudioFeaturesResponse.json()) as AudioFeature;
}

export async function getPlaylistItems(
  accessToken: string,
  playlistId: string,
) {
  const result = await measurePerformance(async () => {
    return (await fetchAllData(
      "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
      { headers: { Authorization: "Bearer " + accessToken } },
    )) as PlaylistItem[];
  });

  console.log(`${getPlaylistItems.name} took ${result.time}ms`);
  return result.returnValue;
}

async function _getChunkOfAudioFeatures(accessToken: string, tracks: Track[]) {
  const trackIds = tracks.map((track) => track.id);
  const result = await fetch(
    `https://api.spotify.com/v1/audio-features?ids=${trackIds.join(",")}`,
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return (await result.json()).audio_features as AudioFeature[];
}

export async function getSeveralAudioFeatures(
  accessToken: string,
  tracks: Track[],
) {
  const spotifyApiTrackMax = 100; // https://g.co/gemini/share/3d6aefc1b030
  const chunkedTracks = chunk(tracks, spotifyApiTrackMax);

  const audioFeatureChunks = await Promise.all(
    chunkedTracks.map(
      async (chunk) => await _getChunkOfAudioFeatures(accessToken, chunk),
    ),
  );

  return audioFeatureChunks.flat();
}
