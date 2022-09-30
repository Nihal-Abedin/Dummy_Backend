const configuration = require('../configuration');
const express = require('express');
const ApiError = require('../common/api-error');
const StringUtilities = require('../common/string-utilities');
const {
  getAdmin, findUserByUserId, findUsers, addUser,
  findUserByUsername, updateUser,
} = require('../services/user-service');
const router = express.Router();
const JsonWebToken = require('jsonwebtoken');
const FileUtilities = require('../common/file-utilities');
const path = require('path');

router.post('/login', async (request, response, next) => {
  try {
    const isNonExpiring = StringUtilities.sanitize(request.headers["x-non-expiring"]).toLowerCase() === "true";
    let { username, password, } = request.body;

    username = StringUtilities.sanitize(username);

    const errors = [];

    if (!username) {
      errors.push({
        username: "Username must be provided.",
      });
    } else if (username.length < 2 || username.length > 12) {
      errors.push({
        username: "Username must be between 2 to 12 characters.",
      });
    }

    if (!password) {
      errors.push({ password: "Password must be provided.", });
    } else if (password.length < 8) {
      errors.push({ password: "Password must be atleast 8 characters long.", });
    }

    if (errors.length) {
      throw new ApiError(400, "Request data validation failed.", undefined, { errors });
    }

    const user = findUserByUsername(username);

    if (!user) {
      throw new ApiError(404, "No account associated with the specified username.");
    }

    if (user.password !== password) {
      throw new ApiError(400, "Incorrect password provided.");
    }

    // generates access token...
    const accessToken = JsonWebToken.sign({ userId: user.userId, }, configuration.authorization.accessTokenSecretKey,
      isNonExpiring ? undefined : { expiresIn: configuration.authorization.accessTokenExpiresIn, });
    // generates refresh token that never expires...
    const refreshToken = JsonWebToken.sign({ accessTokenSignature: accessToken.split(".")[2], }, configuration.authorization.refreshTokenSecretKey);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'User logged in successfully.',
      data: {
        tokenType: "bearer",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (request, response, next) => {
  try {
    let {
      username, email, mobile, password, confirmPassword, address,
      university, weight, height, maritalStatus,
    } = request.body;

    username = StringUtilities.sanitize(username);
    email = StringUtilities.sanitize(email);
    mobile = StringUtilities.sanitize(mobile);
    address = StringUtilities.sanitize(address);
    university = StringUtilities.sanitize(university);
    maritalStatus = StringUtilities.sanitize(maritalStatus).toLowerCase();
    weight = isNaN(weight) ? weight : Number(weight);
    height = isNaN(height) ? height : Number(height);

    const errors = [];

    if (!username) {
      errors.push({
        username: "Username must be provided.",
      });
    } else if (username.length < 2 || username.length > 12) {
      errors.push({
        username: "Username must be between 2 to 12 characters.",
      });
    }

    const existingUser = findUserByUsername(username);

    if (existingUser) {
      errors.push({ username: "Requested username is already in use.", });
    }

    if (!email || !email.match(/(.+)@(.+){2,}\.(.+){2,}/)) {
      errors.push({ email: "Invalid email address provided.", });
    }

    if (mobile.length !== 14 || !mobile.startsWith("+880")) {
      errors.push({ mobile: "Mobile number must be of '+8801xxxxxxxx' format.", });
    }

    if (maritalStatus && !["married", "unmarried"].includes(maritalStatus)) {
      errors.push({ maritalStatus: "Invalid value provided for marital status.", });
    }

    if (!password) {
      errors.push({ password: "Password must be provided.", });
    } else if (password.length < 8) {
      errors.push({ password: "Password must be atleast 8 characters long.", });
    }

    if (password !== confirmPassword) {
      errors.push({ confirmPassword: "Password and confirm password must match.", });
    }

    if (weight && isNaN(weight)) {
      errors.push({ weight: "Weight must be a valid number.", });
    }

    if (height && isNaN(height)) {
      errors.push({ height: "Height must be a valid number.", });
    }

    if (errors.length) {
      throw new ApiError(400, "Request data validation failed.", undefined, { errors });
    }

    const user = addUser({
      username: username,
      email: email,
      mobile: mobile,
      password: password,
      address: address,
      university: university,
      weight: weight,
      height: height,
      maritalStatus: maritalStatus,
      userType: "USER",
    });

    const isNonExpiring = StringUtilities.sanitize(request.headers["x-non-expiring"]).toLowerCase() === "true";
    // generates access token...
    const accessToken = JsonWebToken.sign({ userId: user.userId, }, configuration.authorization.accessTokenSecretKey,
      isNonExpiring ? undefined : { expiresIn: configuration.authorization.accessTokenExpiresIn, });
    // generates refresh token that never expires...
    const refreshToken = JsonWebToken.sign({ accessTokenSignature: accessToken.split(".")[2], }, configuration.authorization.refreshTokenSecretKey);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'User registration successful.',
      data: {
        tokenType: "bearer",
        accessToken: accessToken,
        refreshToken: refreshToken,
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/admin', async (request, response, next) => {
  try {
    const admin = getAdmin();

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Admin account information retrieved successfully.',
      data: {
        admin: admin,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/self', async (request, response, next) => {
  try {
    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Account information retrieved successfully.',
      data: {
        account: request.user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:userId', async (request, response, next) => {
  try {
    const user = findUserByUserId(parseInt(request.params.userId));

    if (!user) { throw new ApiError(404, "Requested user was not found."); }

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'User information retrieved successfully.',
      data: {
        user: user,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/', async (request, response, next) => {
  try {
    const result = findUsers(request.query.query, request.query.limit,
      request.query.offset, request.query.currentPage, request.query.sortBy, request.query.orderBy);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Users retrieved successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

router.put('/self', async (request, response, next) => {
  try {
    let {
      email, mobile, address, university, weight, height,
      maritalStatus, profilePicture,
    } = request.body;

    email = StringUtilities.sanitize(email);
    mobile = StringUtilities.sanitize(mobile);
    address = StringUtilities.sanitize(address);
    university = StringUtilities.sanitize(university);
    maritalStatus = StringUtilities.sanitize(maritalStatus).toLowerCase();
    profilePicture = StringUtilities.sanitize(profilePicture);
    weight = isNaN(weight) ? weight : Number(weight);
    height = isNaN(height) ? height : Number(height);

    const errors = [];

    if (!email || !email.match(/(.+)@(.+){2,}\.(.+){2,}/)) {
      errors.push({ email: "Invalid email address provided.", });
    }

    if (mobile.length !== 14 || !mobile.startsWith("+880")) {
      errors.push({ mobile: "Mobile number must be of '+8801xxxxxxxx' format.", });
    }

    if (maritalStatus && !["married", "unmarried"].includes(maritalStatus)) {
      errors.push({ maritalStatus: "Invalid value provided for marital status.", });
    }

    if (weight && isNaN(weight)) {
      errors.push({ weight: "Weight must be a valid number.", });
    }

    if (height && isNaN(height)) {
      errors.push({ height: "Height must be a valid number.", });
    }

    if (profilePicture) {
      const filePath = path.join(configuration.uploads.directoryPath, profilePicture);

      if (!FileUtilities.exists(filePath)) {
        errors.push({ profilePicture: "Provided profile picture does not exist.", });
      }
    }

    if (errors.length) {
      throw new ApiError(400, "Request data validation failed.", undefined, { errors });
    }

    const account = updateUser({
      ...request.user,
      email: email,
      mobile: mobile,
      address: address,
      university: university,
      maritalStatus: maritalStatus,
      weight: weight,
      height: height,
      profilePicture: profilePicture,
    });

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Account information updated successfully.',
      data: {
        account: account,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.put('/:userId', async (request, response, next) => {
  try {
    const user = findUserByUserId(parseInt(request.params.userId));

    if (!user) { throw new ApiError(404, "Requested user was not found."); }

    let {
      email, mobile, address, university, weight, height, maritalStatus,
    } = request.body;

    email = StringUtilities.sanitize(email);
    mobile = StringUtilities.sanitize(mobile);
    address = StringUtilities.sanitize(address);
    university = StringUtilities.sanitize(university);
    maritalStatus = StringUtilities.sanitize(maritalStatus).toLowerCase();
    weight = isNaN(weight) ? weight : Number(weight);
    height = isNaN(height) ? height : Number(height);

    const errors = [];

    if (!email || !email.match(/(.+)@(.+){2,}\.(.+){2,}/)) {
      errors.push({ email: "Invalid email address provided.", });
    }

    if (mobile.length !== 14 || !mobile.startsWith("+880")) {
      errors.push({ mobile: "Mobile number must be of '+8801xxxxxxxx' format.", });
    }

    if (maritalStatus && !["married", "unmarried"].includes(maritalStatus)) {
      errors.push({ maritalStatus: "Invalid value provided for marital status.", });
    }

    if (weight && isNaN(weight)) {
      errors.push({ weight: "Weight must be a valid number.", });
    }

    if (height && isNaN(height)) {
      errors.push({ height: "Height must be a valid number.", });
    }

    if (errors.length) {
      throw new ApiError(400, "Request data validation failed.", undefined, { errors });
    }

    const _user = updateUser({
      ...user,
      email: email,
      mobile: mobile,
      address: address,
      university: university,
      maritalStatus: maritalStatus,
      weight: weight,
      height: height,
    });

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'User account information updated successfully.',
      data: {
        user: _user,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
