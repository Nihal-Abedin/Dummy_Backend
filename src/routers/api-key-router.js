const express = require('express');
const ApiError = require('../common/api-error');
const StateManagementService = require('../services/state-management-service');
const configuration = require('../configuration');
const { getApiKey, setApiKey, generateApiKey, } = require('../services/api-key-service');
const router = express.Router();

router.get('/', (request, response, next) => {
  try {
    if (!request.isSuperUser) {
      throw new ApiError(401, "You are not authorized to request the resource.");
    }

    const apiKey = getApiKey();

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Successfully retrieved API key.',
      data: {
        apiKey: apiKey,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (request, response, next) => {
  try {
    if (!request.isSuperUser) {
      throw new ApiError(401, "You are not authorized to request the resource.");
    }

    let apiKey = request.body.apiKey;

    // if API key is provided...
    if (apiKey) {
      // if type of API key is not string...
      if (typeof apiKey !== "string") {
        // we'll throw error...
        throw new ApiError(400, "Invalid API key provided.");
      }

      // if provided API key has an invalid length...
      if (apiKey.length !== configuration.apiKeyLength) {
        // we'll throw error...
        throw new ApiError(400, `API key must be ${configuration.apiKeyLength} characters long.`);
      }
    } else {
      // otherwise, we'll generate a new API key...
      apiKey = generateApiKey();
    }

    // sets the API key...
    setApiKey(apiKey);

    const stateManagementService = StateManagementService.getInstance();
    // set API key to state...
    await stateManagementService.setAsync("apiKey", apiKey);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'API key updated successfully.',
      data: {
        apiKey: apiKey,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
