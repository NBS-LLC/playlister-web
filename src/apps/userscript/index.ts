import { getCamelotValue, getKeyName } from "#lib/audio";
import { AudioAnalyzer } from "#lib/audio-analysis";
import { onMutation, waitForElem } from "#lib/html";
import { SpotifyWebPage } from "#lib/spotify-web";

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log("now playing track:", trackId);

  const audioAnalyzer = new AudioAnalyzer(fetch);
  const enrichedTrack = await audioAnalyzer.getEnrichedTrack(trackId);
  console.log(enrichedTrack.toString());

  console.groupCollapsed("enriched track data");
  console.log(enrichedTrack.details);
  console.log(enrichedTrack.features);
  console.groupEnd();

  spotifyWebPage.enrichNowPlayingTrack(
    Math.round(enrichedTrack.features.tempo),
    getKeyName(enrichedTrack.features.key, enrichedTrack.features.mode),
    getCamelotValue(enrichedTrack.features.key, enrichedTrack.features.mode),
  );
}

function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then((elem) => {
    onMutation(elem, enrichNowPlaying);
    enrichNowPlaying();
  });
}

main();
