import { fetchAllData } from "./http";

type PlaylistItems = [
  item: {
    track: {
      id: string;
    };
  },
];

/**
 * Assumes the user is logged into Spotify (uses auth from cookies).
 */
export async function getAccessToken() {
  const tokenResponse = await fetch(
    "https://open.spotify.com/get_access_token?reason=transport&productType=web_player",
  );

  return (await tokenResponse.json()).accessToken as string;
}

export async function getCurrentTrack(accessToken: string) {
  const currentTrackResponse = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return await currentTrackResponse.json();
}

export async function getTrackAudioFeatures(
  accessToken: string,
  trackId: string,
) {
  const trackAudioFeaturesResponse = await fetch(
    "https://api.spotify.com/v1/audio-features/" + trackId,
    { headers: { Authorization: "Bearer " + accessToken } },
  );

  return await trackAudioFeaturesResponse.json();
}

export async function getPlaylistItems(
  accessToken: string,
  playlistId: string,
): Promise<PlaylistItems> {
  const startTime = performance.now();
  const result = (await fetchAllData(
    "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks",
    { headers: { Authorization: "Bearer " + accessToken } },
  )) as PlaylistItems;
  const endTime = performance.now();

  console.log(`${getPlaylistItems.name} took ${endTime - startTime}ms`);
  return result;
}
