import { getCamelotValue, getKeyName } from "#lib/audio";
import { AudioAnalyzer } from "#lib/audio-analysis";
import { onMutation, waitForElem } from "#lib/html";
import { SpotifyWebPage } from "#lib/spotify-web";

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalyzer = new AudioAnalyzer(fetch);
  const trackDetails = await audioAnalyzer.getTrackDetails(trackId);
  const trackFeatures = await audioAnalyzer.getTrackFeatures(trackId);

  console.log(
    "%s by %s (%f %s %s)",
    trackDetails.trackTitle,
    trackDetails.artists[0].name,
    trackFeatures.tempo,
    getKeyName(trackFeatures.key, trackFeatures.mode),
    getCamelotValue(trackFeatures.key, trackFeatures.mode),
  );

  console.groupCollapsed("enriched track data");
  console.log(trackDetails);
  console.log(trackFeatures);
  console.groupEnd();

  spotifyWebPage.enrichNowPlayingTrack(
    Math.round(trackFeatures.tempo),
    getKeyName(trackFeatures.key, trackFeatures.mode),
    getCamelotValue(trackFeatures.key, trackFeatures.mode),
  );
}

function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then((elem) => {
    onMutation(elem, enrichNowPlaying);
    enrichNowPlaying();
  });
}

main();
