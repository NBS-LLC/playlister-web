interface Artist {
  id: string;
  name: string;
  href: string;
}

export interface TrackDetails {
  id: string;
  trackTitle: string;
  artists: Artist[];
  durationMs: number;
  isrc: string;
  ean: string;
  upc: string;
  href: string;
  availableCountries?: string;
  popularity: number;
}
