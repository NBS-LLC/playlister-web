import { AudioAnalyzer } from "#lib/audio-analysis/AudioAnalyzer";
import { ReccoBeatsAnalyzer } from "#lib/audio-analysis/ReccoBeatsAnalyzer";
import { config } from "#lib/config";
import { onMutation, waitForElem } from "#lib/html";
import { log } from "#lib/log";
import { SpotifyWebPage } from "#lib/spotify-web/SpotifyWebPage";
import { Cache } from "#lib/storage/Cache";
import { LocalStorageAdapter } from "#lib/storage/LocalStorageAdapter";

config.appName = "SpotAVibe Lite";
config.appId = "spotavibe-lite";

const cacheProvider = new Cache(new LocalStorageAdapter(localStorage));
cacheProvider.prune();

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log(log.namespace, `Now playing track id: ${trackId}.`);

  const audioAnalyzer = new AudioAnalyzer(
    new ReccoBeatsAnalyzer(fetch),
    cacheProvider,
  );

  const enrichedTrack = await audioAnalyzer.getEnrichedTrack(trackId);
  console.log(log.namespace, enrichedTrack.getHumanReadableString());

  console.groupCollapsed(log.namespace, "Enriched Track Data");
  console.log(enrichedTrack.details);
  console.log(enrichedTrack.features);
  console.groupEnd();

  spotifyWebPage.insertNowPlayingTrackStats(enrichedTrack.getStatsString());
}

async function enrichTracks(mutationRecord: MutationRecord) {
  for (const node of mutationRecord.addedNodes) {
    if (node instanceof Element) {
      const links = node.querySelectorAll('a[href^="/track/"]');
      links.forEach((link) => {
        console.debug(link);
      });
    }
  }
}

function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then((elem) => {
    onMutation(elem, enrichNowPlaying, { attributes: true, childList: false });
    enrichNowPlaying();
  });

  waitForElem("#main-view").then((elem) => {
    onMutation(elem, enrichTracks, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  });
}

main();
