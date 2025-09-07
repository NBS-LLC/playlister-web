import { AudioAnalyzer, ReccoBeatsAnalyzer } from "#lib/audio-analysis";
import { onMutation, waitForElem } from "#lib/html";
import { SpotifyWebPage } from "#lib/spotify-web";

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalyzer = new AudioAnalyzer(new ReccoBeatsAnalyzer(fetch));
  const enrichedTrack = await audioAnalyzer.getEnrichedTrack(trackId);
  console.log(enrichedTrack.getHumanReadableString());

  console.groupCollapsed("enriched track data");
  console.log(enrichedTrack.details);
  console.log(enrichedTrack.features);
  console.groupEnd();

  spotifyWebPage.insertNowPlayingTrackStats(enrichedTrack.getStatsString());
}

function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then((elem) => {
    onMutation(elem, enrichNowPlaying);
    enrichNowPlaying();
  });
}

main();
