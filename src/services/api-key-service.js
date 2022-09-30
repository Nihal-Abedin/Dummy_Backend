const { RandomGenerator } = require("@shahadul-17/random-generator");
const configuration = require("../configuration");

let _apiKey;

const getApiKey = () => _apiKey;

const setApiKey = apiKey => _apiKey = apiKey;

const generateApiKey = () => {
  const apiKey = RandomGenerator.generateString(configuration.apiKeyLength);

  return apiKey;
};

module.exports.getApiKey = getApiKey;
module.exports.setApiKey = setApiKey;
module.exports.generateApiKey = generateApiKey;
