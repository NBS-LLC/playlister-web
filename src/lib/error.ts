import { config } from "./config";

export class LibError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(`[${config.appId}] ${message}`, options);
  }
}
