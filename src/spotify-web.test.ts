import {
  formatTrackDetails,
  PlaylistItemWithAudioFeatures,
} from "./spotify-web";

describe(formatTrackDetails.name, () => {
  it("should return the correct track details", () => {
    const track: PlaylistItemWithAudioFeatures = {
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
    };

    expect(formatTrackDetails(track)).toBe(
      "Track Name by Artist Name (120 E 12B)",
    );
  });
});
