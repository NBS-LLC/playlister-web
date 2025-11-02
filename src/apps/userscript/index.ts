import { AudioAnalyzer } from "#lib/audio-analysis/AudioAnalyzer";
import { ReccoBeatsAnalyzer } from "#lib/audio-analysis/ReccoBeatsAnalyzer";
import { config } from "#lib/config";
import { onMutation, waitForElem } from "#lib/html";
import { log } from "#lib/log";
import { SequentialProcessor } from "#lib/queue/SequentialProcessor";
import { SpotifyWebPage } from "#lib/spotify-web/SpotifyWebPage";
import { Cache } from "#lib/storage/Cache";
import { LocalStorageAdapter } from "#lib/storage/LocalStorageAdapter";

config.appName = "SpotAVibe Lite";
config.appId = "spotavibe-lite";

const cacheProvider = new Cache(new LocalStorageAdapter(localStorage));
cacheProvider.prune().then(async () => {
  console.debug(
    log.namespace,
    `Cache count: ${await cacheProvider.getNamespaceItemCount()} (namespaced) / ${await cacheProvider.getAllItemCount()} (total) items.`,
  );

  console.debug(
    log.namespace,
    `Cache usage: ${await cacheProvider.getNamespaceUsageInBytes()} (namespaced) / ${await cacheProvider.getAllUsageInBytes()} (total) bytes.`,
  );
});

const audioAnalyzer = new AudioAnalyzer(
  new ReccoBeatsAnalyzer(fetch),
  cacheProvider,
);

const seqProcessor = new SequentialProcessor(enrichTrack, 150);

const spotifyWebPage = new SpotifyWebPage();

async function enrichNowPlaying() {
  const trackId = spotifyWebPage.getNowPlayingTrackId();
  console.log(log.namespace, `Now playing track id: ${trackId}.`);

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
      const links = node.querySelectorAll<HTMLAnchorElement>(
        spotifyWebPage.trackLink,
      );

      links.forEach((link) => {
        seqProcessor.enqueue(link);
      });
    }
  }
}

async function enrichTrack(element: HTMLAnchorElement) {
  const trackId = element.href.split("/").at(-1)!;
  const enrichedTrack = await audioAnalyzer.getEnrichedTrack(trackId);
  console.log(log.namespace, enrichedTrack.getHumanReadableString());

  console.groupCollapsed(log.namespace, "Enriched Track Data");
  console.log(enrichedTrack.details);
  console.log(enrichedTrack.features);
  console.groupEnd();

  spotifyWebPage.insertTrackStats(element, enrichedTrack.getStatsString());
}

function main() {
  waitForElem(spotifyWebPage.nowPlayingTrack).then((elem) => {
    onMutation(elem, enrichNowPlaying, { attributes: true, childList: false });
    enrichNowPlaying();
  });

  waitForElem(spotifyWebPage.mainView).then((elem) => {
    onMutation(elem, enrichTracks, {
      attributes: false,
      childList: true,
      subtree: true,
    });
  });
}

main();
