import { getCamelotValue, getKeyName } from "#lib/audio";
import { AudioAnalyzer } from "#lib/audio-analysis";
import { onMutation, waitForElem } from "#lib/html";
import { SpotifyWebPage } from "#lib/spotify-web";

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalysis = new AudioAnalyzer(fetch);
  const trackDetails = await audioAnalysis.getTrackDetails(trackId);
  const trackFeatures = await audioAnalysis.getTrackFeatures(trackId);
  console.log(trackDetails);
  console.log(trackFeatures);

  spotifyWebPage.enrichNowPlayingTitle(
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
