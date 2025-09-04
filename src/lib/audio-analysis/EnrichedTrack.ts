import { getCamelotValue, getKeyName } from "../audio";
import { Enrichment } from "../spotify-web/Enrichment";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class EnrichedTrack implements Enrichment {
  constructor(
    readonly id: string,
    readonly details: TrackDetails,
    readonly features: TrackFeatures,
  ) {}

  getHumanReadableString() {
    const title = this.details.trackTitle;
    const artist = this.details.artists[0].name;
    const tempo = this.features.tempo;
    const keyName = getKeyName(this.features.key, this.features.mode);
    const camelotValue = getCamelotValue(this.features.key, this.features.mode);
    return `${title} by ${artist} (${tempo} ${keyName} ${camelotValue})`;
  }

  getStatsString() {
    const tempo = this.features.tempo;
    const keyName = getKeyName(this.features.key, this.features.mode);
    const camelotValue = getCamelotValue(this.features.key, this.features.mode);
    return `${Math.round(tempo)} | ${keyName} | ${camelotValue}`;
  }
}
