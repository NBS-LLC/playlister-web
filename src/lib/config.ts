const MB = 1024 * 1024;

export class ConfigError extends Error {}

class Config {
  private _appName = "";
  private _appId = "";

  private _cacheQuotaMaxBytes = 4 * MB;
  private _cacheQuotaTargetBytes = 3 * MB;

  get appName() {
    if (!this._appName) {
      throw new ConfigError("appName not set");
    }

    return this._appName;
  }

  set appName(value: string) {
    this._appName = value;
  }

  get appId() {
    if (!this._appId) {
      throw new ConfigError("appId not set");
    }

    return this._appId;
  }

  set appId(value: string) {
    this._appId = value;
  }

  get namespace() {
    return `${this.appId}:`;
  }

  get cacheQuotaMaxBytes() {
    return this._cacheQuotaMaxBytes;
  }

  set cacheQuotaMaxBytes(value: number) {
    this._cacheQuotaMaxBytes = value;
  }

  get cacheQuotaTargetBytes() {
    return this._cacheQuotaTargetBytes;
  }

  set cacheQuotaTargetBytes(value: number) {
    this._cacheQuotaTargetBytes = value;
  }
}

export const config = new Config();
