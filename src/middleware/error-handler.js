const ApiError = require("../common/api-error");
const configuration = require("../configuration");

module.exports.errorHandler = (error, request, response, next) => {
  const apiError = ApiError.fromError(error);
  const apiResponse = apiError.toResponse(configuration.includeErrorStack);
  const ipAddress = request.ipAddress;

  console.error(`An error occurred while processing '${request.method}' request for '${request.originalUrl}' from ${ipAddress}.`, error);

  response.status(apiResponse.status).send(apiResponse);
};
