import { AudioAnalysis } from "../../lib/audio-analysis";
import { onMutation, waitForElem } from "../../lib/html";
import { SpotifyWebPage } from "../../lib/spotify-web/index";

const spotifyWebPage = new SpotifyWebPage();

async function logNowPlayingTrack() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalysis = new AudioAnalysis(fetch);
  console.log(await audioAnalysis.getTrackDetails(trackId));
  console.log(await audioAnalysis.getTrackFeatures(trackId));
}

async function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then(async (elem) => {
    onMutation(elem, logNowPlayingTrack);
    await logNowPlayingTrack();
  });
}

main();
