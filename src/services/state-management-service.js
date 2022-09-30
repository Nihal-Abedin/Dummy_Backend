const FileUtilities = require("../common/file-utilities");
const configuration = require("../configuration");

class StateManagementService {

  _states = {};
  static _instance = new StateManagementService();

  /**
   * Sets a new entry to state.
   * @param {String} key 
   * @param {any} value 
   * @returns {Promise<Boolean>} Returns true if successfully added and saved.
   * Otherwise returns false.
   */
  async setAsync(key, value) {
    this._states[key] = value;

    await this.saveAsync();
  }

  /**
   * Retrieves an entry from state.
   * @param {String} key 
   * @param {any} value 
   * @returns {any} Returns the value. Returns undefined if not found.
   */
  get(key) {
    return this._states[key];
  }

  async loadAsync() {
    const _states = await FileUtilities.readFromFileAsync(configuration.stateManagement.filePath, true);

    // if data is not an object...
    if (!_states || typeof _states !== "object") { return; }

    this._states = _states;
  }

  saveAsync() {
    return FileUtilities.writeToFileAsync(configuration.stateManagement.filePath, this._states);
  }

  /**
   * @returns {StateManagementService}
   */
  static getInstance() { return this._instance; }
};

module.exports = StateManagementService;
