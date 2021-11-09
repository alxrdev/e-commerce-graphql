const { Query } = require("./Query");
const { Product } = require("./Product");
const { Category } = require("./Category");
const { Mutation } = require("./Mutation");

exports.resolvers = {
  Query,
  Product,
  Category,
  Mutation,
};
