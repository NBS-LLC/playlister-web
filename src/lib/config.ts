export const config = {
  appName: "",
  appId: "",

  get namespace() {
    return config.appId ? `${config.appId}:` : "";
  },
};
