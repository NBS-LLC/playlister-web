import { config } from "./config";

export const log = {
  get namespace() {
    return `[${config.appId}]`;
  },
};
