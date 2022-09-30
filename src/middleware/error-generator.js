const { RandomGenerator } = require('@shahadul-17/random-generator');
const ApiError = require('../common/api-error');

const __shallThrowError = () => {
  const randomNumber = RandomGenerator.generateIntegerInRange(1, 101);

  return randomNumber > 90;
};

module.exports.errorGenerator = (request, _, next) => {
  const shallThrowError = __shallThrowError();

  // checks if error shall be thrown...
  if (shallThrowError) {
    next(new ApiError(500, "An error occurred while processing your request."));

    console.info(`Throwing error for '${request.method}' request received from '${request.ipAddress}' for '${request.originalUrl}'`);

    return;
  }

  next();
};
