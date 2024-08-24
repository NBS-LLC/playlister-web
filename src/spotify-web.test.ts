import {
  formatTrack,
  formatTrackDetails,
  TrackWithAudioFeatures,
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
  it("should return the correct track details", () => {
    const track = createTestTrackWithAudioFeatures();
    expect(formatTrackDetails(track)).toBe(
      "Track Name by Artist Name (120 E 12B)",
    );
  });
});

describe(formatTrack.name, () => {
  it("should return the correct formatted track details", () => {
    const track = createTestTrackWithAudioFeatures();
    const expectedOutput = "Track Name (120)";
    expect(formatTrack(track)).toBe(expectedOutput);
  });
});
