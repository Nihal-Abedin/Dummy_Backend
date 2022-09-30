const { RandomGenerator } = require('@shahadul-17/random-generator');
const express = require('express');
const router = express.Router();
const { graphVertices, } = require("../graph-vertices.json");

const __randomizeGraphVertices = graphVertices => {
  const randomNumber = RandomGenerator.generateIntegerInRange(90, 10);
  const _graphVertices = new Array(graphVertices.length);

  for (let i = 0; i < graphVertices.length; i++) {
    const graphVertex = graphVertices[i];
    const _graphVertex = {
      ...graphVertex,
      lastTradedPrice: RandomGenerator.generateIntegerInRange(graphVertex.lastTradedPrice + randomNumber, graphVertex.lastTradedPrice),
      changeInPrice: RandomGenerator.generateIntegerInRange(graphVertex.changeInPrice + randomNumber, graphVertex.changeInPrice),
      priceChangePercentage: RandomGenerator.generateIntegerInRange(graphVertex.priceChangePercentage + randomNumber, graphVertex.priceChangePercentage),
      closingPrice: RandomGenerator.generateIntegerInRange(graphVertex.closingPrice + randomNumber, graphVertex.closingPrice),
      yesterdaysClosingPrice: RandomGenerator.generateIntegerInRange(graphVertex.yesterdaysClosingPrice + randomNumber, graphVertex.yesterdaysClosingPrice),
      highestPrice: RandomGenerator.generateIntegerInRange(graphVertex.highestPrice + randomNumber, graphVertex.highestPrice),
      lowestPrice: RandomGenerator.generateIntegerInRange(graphVertex.lowestPrice + randomNumber, graphVertex.lowestPrice),
      trade: RandomGenerator.generateIntegerInRange(graphVertex.trade + randomNumber, graphVertex.trade),
      value: RandomGenerator.generateIntegerInRange(graphVertex.value + randomNumber, graphVertex.value),
      volume: RandomGenerator.generateIntegerInRange(graphVertex.volume + randomNumber, graphVertex.volume),
    };

    _graphVertices[i] = _graphVertex;
  }

  return _graphVertices;
};

router.get('/', async (_, response, next) => {
  try {
    const _graphVertices = __randomizeGraphVertices(graphVertices);

    return response.status(200).send({
      date: new Date().toUTCString(),
      status: 200,
      message: 'Graph vertices retrieved successfully.',
      data: {
        totalCount: _graphVertices.length,
        graphVertices: _graphVertices,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
