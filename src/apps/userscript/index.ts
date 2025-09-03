import { AudioAnalysis } from "../../lib/audio-analysis";
import { onMutation, waitForElem } from "../../lib/html";
import { SpotifyWebPage } from "../../lib/spotify-web/index";

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalysis = new AudioAnalysis(fetch);
  const trackDetails = await audioAnalysis.getTrackDetails(trackId);
  const trackFeatures = await audioAnalysis.getTrackFeatures(trackId);
  console.log(trackDetails);
  console.log(trackFeatures);

  spotifyWebPage.enrichNowPlayingTitle(trackFeatures.tempo);
}

async function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then(async (elem) => {
    onMutation(elem, enrichNowPlaying);
    await enrichNowPlaying();
  });
}

main();
