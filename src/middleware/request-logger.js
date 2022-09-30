const configuration = require("../configuration");

const __getClientIpAddress = request => {
  // actual IP address of the client...
  const ipAddress = request.headers['x-forwarded-for']
    ?? request.socket.remoteAddress;

  return ipAddress;
};

module.exports.requestLogger = (request, response, next) => {
  request.ipAddress = __getClientIpAddress(request);
  response.set("x-powered-by", configuration.poweredBy);

  console.info(`'${request.method}' request received from '${request.ipAddress}' for '${request.originalUrl}'`);

  next();
};
