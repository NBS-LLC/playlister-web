import { EnrichedTrack } from "./EnrichedTrack";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export function _createMockEnrichedTracks(): EnrichedTrack[] {
  const mockTrackDetails1: TrackDetails = {
    id: "675514c6-e440-4df0-b83a-9eb18aa9f2e6",
    trackTitle: "Black Milk",
    artists: [
      {
        id: "d5fe4d70-4bc4-4d96-93f0-deb410026cae",
        name: "Massive Attack",
        href: "https://open.spotify.com/artist/6FXMGgJwohJLUSr5nVlf9X",
      },
      {
        id: "c6d7c609-e760-4d3b-b559-1bd9792b787f",
        name: "Elizabeth Fraser",
        href: "https://open.spotify.com/artist/791Z3924aa619hZ3xsOJEx",
      },
      {
        id: "e3a98256-6f37-440c-b58a-fa3564dc5b26",
        name: "Liz Frazier",
        href: "https://open.spotify.com/artist/2rsTU1XBvJlrKwRySQY3kj",
      },
    ],
    durationMs: 381666,
    isrc: "GBAAA9800347",
    ean: null,
    upc: null,
    href: "https://open.spotify.com/track/1Rezzt36ybaT2ZbDZpv83D",
    availableCountries: "US,GB",
    popularity: 58,
  };

  const mockTrackFeatures1: TrackFeatures = {
    id: "675514c6-e440-4df0-b83a-9eb18aa9f2e6",
    href: "https://open.spotify.com/track/1Rezzt36ybaT2ZbDZpv83D",
    acousticness: 0.00575,
    danceability: 0.56,
    energy: 0.455,
    instrumentalness: 0.757,
    key: 1,
    liveness: 0.219,
    loudness: -11.221,
    mode: 0,
    speechiness: 0.0304,
    tempo: 168.081,
    valence: 0.44,
  };

  return [
    new EnrichedTrack(
      "1Rezzt36ybaT2ZbDZpv83D",
      mockTrackDetails1,
      mockTrackFeatures1,
    ),
  ];
}
