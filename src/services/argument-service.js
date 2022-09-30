module.exports = class ArgumentService {
  static argumentsMap = this.__populateArgumentsMap();

  static __populateArgumentsMap() {
    const argumentsMap = new Map();

    for (let i = 2; i < process.argv.length; i++) {
      const argument = process.argv[i];

      if (!argument.startsWith("--")) {
        continue;
      }

      i++;    // i points to the next index...

      const argumentName = argument.substring(2);
      const argumentValue = process.argv[i];    // next argument is the value...

      argumentsMap.set(argumentName, argumentValue);
    }

    return argumentsMap;
  }

  /**
   * @param {String} argumentName 
   * @returns 
   */
  static getArgument(argumentName) {
    return this.argumentsMap.get(argumentName);
  }
};
