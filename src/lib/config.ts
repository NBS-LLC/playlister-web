const MB = 1024 * 1024;

class Config {
  private _appName = "";
  private _appId = "";

  readonly cacheQuotaMaxBytes = 5 * MB;
  readonly cacheQuotaTargetBytes = 2.5 * MB;

  get appName() {
    if (!this._appName) {
      throw new Error("appName not set");
    }

    return this._appName;
  }

  set appName(value: string) {
    this._appName = value;
  }

  get appId() {
    if (!this._appId) {
      throw new Error("appId not set");
    }

    return this._appId;
  }

  set appId(value: string) {
    this._appId = value;
  }

  get namespace() {
    return `${this.appId}:`;
  }
}

export const config = new Config();
