const configuration = require('../configuration');
const JsonWebToken = require('jsonwebtoken');
const ApiError = require('../common/api-error');
const StringUtilities = require('../common/string-utilities');
const { findUserByUserId } = require('../services/user-service');
const { getApiKey } = require('../services/api-key-service');

const methodsToIgnoreApiKey = ["HEAD", "OPTIONS",];
const routesToIgnoreApiKey = [
  "GET::/api/files",
];
const securedRoutes = [
  "GET::/api/users/self",
  "PUT::/api/users/self",
  "PUT::/api/users::ADMIN",
  "GET::/api/graphVertices::ADMIN",
  "POST::/api/files",
  "PUT::/api/files",
  "DELETE::/api/files::ADMIN",
];

const getSecuredRoute = (method, path) => {
  for (const securedRoute of securedRoutes) {
    const splittedSecuredRoute = securedRoute.split("::");

    if (splittedSecuredRoute[0] === method &&
      path.includes(splittedSecuredRoute[1])) { return securedRoute; }
  }

  return "";
};

const shallIgnoreApiKey = (method, path) => {
  for (const ignoredRoute of routesToIgnoreApiKey) {
    const splittedIgnoredRoute = ignoredRoute.split("::");

    if (splittedIgnoredRoute[0] === method &&
      path.includes(splittedIgnoredRoute[1])) { return true; }
  }

  return false;
};

module.exports.authorizationHandler = (request, _, next) => {
  // sets 'isSuperUser' flag...
  // request.isSuperUser = request.headers["x-super-user-api-key"] === configuration.superUserApiKey;

  // checks the request method if api key shall be ignored...
  // if (!request.isSuperUser && !methodsToIgnoreApiKey.includes(request.method) &&
  //     !shallIgnoreApiKey(request.method, request.originalUrl)) {
  //   const apiKey = getApiKey();
  //   const clientApiKey = request.headers["x-api-key"];

  //   if (clientApiKey !== apiKey) {
  //     next(new ApiError(401, "Invalid API key provided."));

  //     return;
  //   }
  // }

  const securedRoute = getSecuredRoute(request.method, request.originalUrl);

  if (securedRoute) {
    try {
      const authorization = StringUtilities.sanitize(request.headers.authorization);

      if (!authorization) {
        throw new ApiError(401, "You are not authorized to request the resource.");
      }

      const splittedAuthorization = authorization.split(' ');
      const accessTokenType = splittedAuthorization[0].toLowerCase();

      if (accessTokenType !== "bearer") {
        throw new ApiError(401, "Invalid access token detected.");
      }

      const accessToken = splittedAuthorization[1];
      let accessTokenPayload;

      try {
        accessTokenPayload = JsonWebToken.verify(accessToken, configuration.authorization.accessTokenSecretKey);
      } catch (error) {
        console.warn('An error occurred while verifying access token.', error);

        throw new ApiError(401, "You are not authorized to request the resource.", undefined, { isTokenExpired: error.name === "TokenExpiredError", });
      }

      const user = findUserByUserId(accessTokenPayload.userId);

      if (!user) {
        throw new ApiError(401, "You are not authorized to request the resource.");
      }

      const splittedSecuredRoute = securedRoute.split("::");

      if (splittedSecuredRoute.length > 2 && user.userType !== splittedSecuredRoute[2]) {
        throw new ApiError(401, "You are not authorized to request the resource.");
      }

      request.user = user;
    } catch (error) {
      next(error);
    }
  }

  next();
};
