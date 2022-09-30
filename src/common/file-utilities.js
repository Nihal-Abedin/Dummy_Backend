const { RandomGenerator } = require('@shahadul-17/random-generator');
const fs = require('fs');
const path = require('path');
const JsonSerializer = require('./json-serializer');

class FileUtilities {
  /**
   * 
   * @param {String} filePath 
   * @returns {Promise<boolean>} 
   */
  static deleteFileAsync(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, error => {
        if (error) {
          resolve(false);

          return;
        }

        resolve(true);
      });
    });
  }

  static exists(path) {
    return fs.existsSync(path);
  }

  static createDirectoryAsync(directoryPath) {
    if (FileUtilities.exists(directoryPath)) { return; }

    fs.mkdirSync(directoryPath, { recursive: true, });
  }

  /**
   * 
   * @param {String} filePath 
   * @param {String} fileName 
   * @param {Number} length 
   * @returns {String}
   */
  static generateFileName(filePath, fileName, length = 64) {
    const fileExtension = path.extname(fileName).toLowerCase();
    let _fileName;
    let fileExists;

    do {
      _fileName = RandomGenerator.generateString(length - fileExtension.length);
      _fileName = `${_fileName}${fileExtension}`;
      fileExists = FileUtilities.exists(`${filePath}/${_fileName}`);
    } while (fileExists);

    return _fileName;
  }

  /**
   * 
   * @param {String} filePath 
   * @param {*} file 
   * @returns {Promise<Boolean>}
   */
  static moveFileAsync(filePath, file) {
    return new Promise((resolve, reject) => {
      file.mv(filePath, error => {
        if (error) {
          console.error(error);

          resolve(false);

          return;
        }

        resolve(true);
      });
    });
  };

  /**
   * 
   * @param {String} filePath 
   * @param {any} content 
   * @param {fs.WriteFileOptions} options
   * @returns {Promise<Boolean>} 
   */
  static writeToFileAsync(filePath, content, options = undefined) {
    return new Promise(resolve => {
      let _content = content;

      if (typeof _content === "object") {
        try {
          _content = JsonSerializer.serialize(_content, 2, true);
        } catch (error) {
          console.warn("An error occurred during JSON serialization.", error);
        }
      }

      fs.writeFile(filePath, _content, options, error => {
        if (error) {
          console.error("An error occurred while writing to file.", error);

          resolve(false);

          return;
        }

        resolve(true);
      });
    });
  }

  /**
   * 
   * @param {String} filePath 
   * @param {Boolean} readAsJson
   * @returns {Promise<String|Object>} 
   */
  static readFromFileAsync(filePath, readAsJson = false) {
    return new Promise(resolve => {
      fs.readFile(filePath, "utf-8", (error, data) => {
        if (error) {
          console.error("An error occurred while reading from file.", error);

          resolve(undefined);

          return;
        }

        let _data = data;

        if (readAsJson && ((_data.startsWith('{') && _data.endsWith('}')) || (_data.startsWith('[') && _data.endsWith(']')))) {
          _data = JsonSerializer.deserialize(_data);
        }

        resolve(_data);
      });
    });
  }
};

module.exports = FileUtilities;
