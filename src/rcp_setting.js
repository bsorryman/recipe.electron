import settings from 'electron-settings';

export default class RcpSetting {
  constructor() {

  }

  static setDatabasePath(path) {
    settings.setSync('database_path', path);
  }

  static getDatabasePath() {
    return settings.getSync('database_path');
  }

}