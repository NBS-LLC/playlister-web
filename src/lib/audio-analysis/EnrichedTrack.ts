import { getCamelotValue, getKeyName } from "../audio";
import { TrackDetails } from "./TrackDetails";
import { TrackFeatures } from "./TrackFeatures";

export class EnrichedTrack {
  constructor(
    readonly id: string,
    readonly details: TrackDetails,
    readonly features: TrackFeatures,
  ) {}

  toString() {
    const title = this.details.trackTitle;
    const artist = this.details.artists[0].name;
    const tempo = this.features.tempo;
    const keyName = getKeyName(this.features.key, this.features.mode);
    const camelotValue = getCamelotValue(this.features.key, this.features.mode);
    return `${title} by ${artist} (${tempo} ${keyName} ${camelotValue})`;
  }

  toStats() {
    const tempo = this.features.tempo;
    const keyName = getKeyName(this.features.key, this.features.mode);
    const camelotValue = getCamelotValue(this.features.key, this.features.mode);
    return `${Math.round(tempo)} | ${keyName} | ${camelotValue}`;
  }
}
