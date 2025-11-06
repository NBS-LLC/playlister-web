const MB = 1024 * 1024;

export const config = {
  appName: "",
  appId: "",

  cacheQuotaMaxBytes: 5 * MB,
  cacheQuotaTargetBytes: 2.5 * MB,

  get namespace() {
    return `${config.appId}:`;
  },
};
