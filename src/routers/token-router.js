const configuration = require('../configuration');
const express = require('express');
const router = express.Router();
const JsonWebToken = require('jsonwebtoken');
const StringUtilities = require('../common/string-utilities');
const ApiError = require('../common/api-error');
const { findUserByUserId } = require('../services/user-service');

router.put('/renew', async (request, response, next) => {
  try {
    const isNonExpiring = StringUtilities.sanitize(request.headers["x-non-expiring"]).toLowerCase() === "true";

    const authorization = StringUtilities.sanitize(request.headers.authorization);
    const splittedAuthorization = authorization.split(' ');
    const accessTokenType = splittedAuthorization[0].toLowerCase();
    const accessToken = splittedAuthorization[1];
    let accessTokenPayload;

    const authorizationRefresh = StringUtilities.sanitize(request.headers["authorization-refresh"]);
    const splittedAuthorizationRefresh = authorizationRefresh.split(' ');
    const refreshTokenType = splittedAuthorizationRefresh[0].toLowerCase();
    const refreshToken = splittedAuthorizationRefresh[1];
    let refreshTokenPayload;

    const errors = [];

    if (!authorization) {
      errors.push({
        authorization: "Mandatory header 'authorization' not provided.",
      });
    } else {
      if (accessTokenType !== "bearer") {
        errors.push({
          authorization: "Invalid access token provided.",
        });
      } else {
        try {
          accessTokenPayload = JsonWebToken.verify(accessToken, configuration.authorization.accessTokenSecretKey, { ignoreExpiration: true, });
        } catch (error) {
          console.warn('An error occurred while verifying access token (expiration ignored).', error);

          errors.push({
            authorization: "Invalid access token provided.",
          });
        }
      }
    }

    if (!authorizationRefresh) {
      errors.push({
        "authorization-refresh": "Mandatory header 'authorization-refresh' not provided.",
      });
    } else {
      if (refreshTokenType !== "bearer") {
        errors.push({
          "authorization-refresh": "Invalid refresh token provided.",
        });
      } else {
        try {
          refreshTokenPayload = JsonWebToken.verify(refreshToken, configuration.authorization.refreshTokenSecretKey);
        } catch (error) {
          console.warn('An error occurred while verifying refresh token.', error);

          errors.push({
            "authorization-refresh": "Invalid refresh token provided.",
          });
        }
      }
    }

    if (errors.length) {
      throw new ApiError(400, "Request data validation failed.", undefined, { errors });
    }

    const splittedAccessToken = accessToken.split('.');
    const accessTokenSignature = splittedAccessToken[2];

    if (accessTokenSignature !== refreshTokenPayload.accessTokenSignature) {
      throw new ApiError(400, "Refresh token does not match the corresponding access token.");
    }

    const user = findUserByUserId(accessTokenPayload.userId);

    if (!user) {
      throw new ApiError(404, "No account associated with the provided access token.");
    }

    // generates access token...
    const renewedAccessToken = JsonWebToken.sign({ userId: user.userId, },
      configuration.authorization.accessTokenSecretKey,
      isNonExpiring ? undefined : { expiresIn: configuration.authorization.accessTokenExpiresIn, });
    // generates refresh token that never expires...
    const renewedRefreshToken = JsonWebToken.sign({ accessTokenSignature: renewedAccessToken.split(".")[2], },
      configuration.authorization.refreshTokenSecretKey);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Token renewal successful.',
      data: {
        tokenType: "bearer",
        accessToken: renewedAccessToken,
        refreshToken: renewedRefreshToken,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
