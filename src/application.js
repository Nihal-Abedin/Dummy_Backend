const configuration = require('./configuration');

require('./common/logger').getInstance();

const http = require('http');
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');

const { requestLogger } = require('./middleware/request-logger');
const { errorHandler } = require('./middleware/error-handler');
const { errorGenerator } = require('./middleware/error-generator');
const { authorizationHandler } = require('./middleware/authorization-handler');
const FileUtilities = require('./common/file-utilities');
const StateManagementService = require('./services/state-management-service');
const { setApiKey, generateApiKey, } = require('./services/api-key-service');

class Application {

  constructor() {
    this.application = express();
    this.application.disable("x-powered-by");
    this.httpServer = new http.Server(this.application);
  }

  start() {
    // adding CORS middleware...
    this.application.use(cors());
    // adding JSON middleware...
    this.application.use(express.json());
    // adding file upload middleware...
    this.application.use(fileUpload({
      useTempFiles: true,
      tempFileDir: configuration.uploads.temporaryDirectoryPath,
      fileSize: configuration.uploads.maximumFileSize,
    }));
    // adding request logger middleware...
    this.application.use(requestLogger);
    // adding authorization handler middleware...
    this.application.use(authorizationHandler);
    // adding error generator middleware...
    this.application.use(errorGenerator);
    // adds express middleware to serve static files...
    this.application.use('/api/files', express.static(configuration.uploads.directoryPath));

    // adds ping router...
    this.application.use('/api/ping', require('./routers/ping-router'));
    // adds user router...
    this.application.use('/api/users', require('./routers/user-router'));
    // adds graph vertex router...
    this.application.use('/api/graphVertices', require('./routers/graph-vertex-router'));
    // adds token router...
    this.application.use('/api/tokens', require('./routers/token-router'));
    // adds file router...
    this.application.use('/api/files', require('./routers/file-router'));
    // adds API key router...
    this.application.use('/api/apiKey', require('./routers/api-key-router'));

    // adding error handler middleware...
    this.application.use(errorHandler);

    this.httpServer.listen(configuration.port, configuration.host, async () => {
      const stateManagementService = StateManagementService.getInstance();
      // loads states...
      await stateManagementService.loadAsync();
      // retrieves API key from state. if not found, generates new API key...
      const apiKey = stateManagementService.get("apiKey") ?? generateApiKey();
      // sets the newly generated API key...
      setApiKey(apiKey);
      // creates uploads directory...
      await FileUtilities.createDirectoryAsync(configuration.uploads.directoryPath);

      console.info(`Server is listening at http://${configuration.host}:${configuration.port}/api`);
    });
  }
}

new Application().start();
