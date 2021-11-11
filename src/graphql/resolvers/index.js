const { categoryResolvers } = require("./category");
const { productResolvers } = require("./product");
const { reviewResolvers } = require("./review");

const rootResolver = {};

exports.resolvers = [
  rootResolver,
  categoryResolvers,
  productResolvers,
  reviewResolvers,
];
