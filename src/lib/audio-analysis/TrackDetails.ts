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
  isrc: string | null;
  ean: string | null;
  upc: string | null;
  href: string;
  availableCountries?: string;
  popularity: number;
}
