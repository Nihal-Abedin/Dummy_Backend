const { users, } = require("../users.json");

const findUserByUserType = userType => {
  const _users = [];

  for (const user of users) {
    if (user.userType !== userType) { continue; }

    _users.push(user);
  }

  return _users;
};

const admin = findUserByUserType("ADMIN")[0];

const getAdmin = () => admin;

const findUserByUserId = userId => {
  for (const user of users) {
    if (user.userId === userId) {
      return user;
    }
  }

  return undefined;
};

const findUserByUsername = username => {
  for (const user of users) {
    if (user.username === username) {
      return user;
    }
  }

  return undefined;
};

const __searchUsers = (query, users) => {
  if (!query) { return users; }

  const _users = [];

  for (const user of users) {
    if (user.username?.toLowerCase().includes(query) || user.email?.toLowerCase().includes(query) ||
      user.mobile?.toLowerCase().includes(query) || user.university?.toLowerCase().includes(query) ||
      user.address?.toLowerCase().includes(query) || user.maritalStatus?.toLowerCase() === query) {
      _users.push(user);
    }
  }

  return _users;
};

const __sortUsers = (sortBy, orderBy, users) => {
  if (!sortBy) { return users; }

  return users.sort((userA, userB) => {
    if (orderBy?.toLowerCase().startsWith("desc")) {
      return userA[sortBy] < userB[sortBy] ? 1 : -1;
    }

    return userA[sortBy] > userB[sortBy] ? 1 : -1;
  });
};

const __limitUsers = (limit, offset, users) => {
  if (!limit || limit > users.length || (typeof offset === "number" && offset + limit > users.length)) {
    limit = users.length - (offset ?? 0);
  }

  // if (typeof offset === "number" && offset + limit > users.length) { return users; }

  const _users = [];

  for (let i = offset ?? 0; i < limit + (offset ?? 0); i++) {
    _users.push(users[i]);
  }

  return _users;
};

const findUsers = (query, limit, offset, currentPage, sortBy = "userId", orderBy = "ASC") => {
  query = !query || query.trim().length === 0 ? undefined : query.trim().toLowerCase();
  limit = !limit || limit === '0' || isNaN(limit) ? 0 : parseInt(limit);
  offset = !offset || offset === '0' || isNaN(offset) ? 0 : parseInt(offset);
  currentPage = !currentPage || currentPage === '0' || isNaN(currentPage) ? undefined : parseInt(currentPage);

  // if limit isn't provided, we'll set current page to '1'...
  if (!limit) { currentPage = 1; }
  // if offset isn't provided but current page is provided, we'll calculate offset...
  if (!offset && currentPage) {
    offset = (currentPage - 1) * limit;
  }
  // now we'll calculate current page...
  if (limit) {
    currentPage = Math.ceil((offset ?? 0) / limit) + 1;
  }

  let _users = __searchUsers(query, users);
  const totalCount = _users.length;
  _users = __sortUsers(sortBy, orderBy, _users);
  _users = __limitUsers(limit, offset, _users);
  const currentCount = _users.length;
  const totalPages = limit ? Math.ceil(totalCount / limit) : 1;

  return {
    query: query,
    limit: limit,
    offset: offset,
    currentCount: currentCount,
    totalCount: totalCount,
    currentPage: currentPage,
    totalPages: totalPages,
    users: _users,
  };
};

const addUser = user => {
  user.userId = users.length + 1;

  users.push(user);

  return user;
};

const updateUser = user => {
  const _user = findUserByUserId(user.userId);

  if (!_user) { return undefined; }

  _user.email = user.email;
  _user.mobile = user.mobile;
  _user.password = user.password;
  _user.address = user.address;
  _user.university = user.university;
  _user.weight = user.weight;
  _user.height = user.height;
  _user.maritalStatus = user.maritalStatus;
  _user.userType = user.userType ?? "USER";
  _user.profilePicture = user.profilePicture;

  return _user;
};

module.exports.getAdmin = getAdmin;
module.exports.findUsers = findUsers;
module.exports.findUserByUserId = findUserByUserId;
module.exports.findUserByUserType = findUserByUserType;
module.exports.addUser = addUser;
module.exports.updateUser = updateUser;
module.exports.findUserByUsername = findUserByUsername;
