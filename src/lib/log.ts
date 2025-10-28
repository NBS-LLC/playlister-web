import { config } from "./config";

export const namespace = config.appId ? `[${config.appId}]` : "";
