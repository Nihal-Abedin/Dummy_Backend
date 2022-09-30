/**
 * This is an example configuration file. To use this, simply copy
 * the content(s) of this file to another file named 'configuration.js'.
 */
const configuration = {
  instanceId: "1",
  host: "127.0.0.1",
  port: "51279",
  poweredBy: "Greeho.com",
  includeErrorStack: true,
  logsDirectory: "./application-data/logs",
  uploads: {
    directoryPath: "./application-data/uploads",
    temporaryDirectoryPath: "./application-data/temporary-files",
    maximumFileSize: 5242880,            // maximum file size is 5 MB...
    fileNameLength: 64,
  },
  authorization: {
    accessTokenExpiresIn: 300,
    accessTokenSecretKey: "iH32obiA@DZzA4pB3s3cp9wDT51gKEdTc!vnKFeJ7sZ15b0l2Lz8716VAx64TmIarvOg80mG18U8e2tX5UD8x7gA661c979M2J1M2TU4rn08k6NFKXic10ACl2o7e3o8",
    refreshTokenSecretKey: "dcf0b68e269Z0fE393930d1deb21ee5881756b54d!a938086d0bd6e86a12?8e185625f74074e6b980fZ39e5f5516f449cY3e293850aeac60499a5234ab4871f1",
  },
  apiKeyLength: 64,
  superUserApiKey: "fb8B0e862ecc625fb7!30f5oZ9d$9c8a07072cebPc5c67f#b692124ffbc41ae8",
  stateManagement: {
    filePath: "./application-data/states.json",
  },
};

module.exports = configuration;
