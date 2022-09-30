const express = require('express');
const router = express.Router();

router.all('/', (request, response, next) => {
  try {
    const { headers, ipAddress, method, body, query, /* params, */ } = request;

    const headersLength = Object.keys(headers).length;
    /* const pathParametersLength = Object.keys(params).length; */
    const queryParametersLength = Object.keys(query).length;
    const requestBodyLength = Object.keys(body).length;
    let userAgent = undefined;

    if (headersLength) {
      userAgent = headers['user-agent'];

      // deletes user agent from headers...
      delete headers['user-agent'];
    }

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Ping request processed successfully.',
      data: {
        httpMethod: method,
        ipAddress: ipAddress,
        userAgent: userAgent,
        headers: headersLength ? headers : undefined,
        /* pathParameters: pathParametersLength ? params : undefined, */
        queryParameters: queryParametersLength ? query : undefined,
        requestBody: requestBodyLength ? body : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
