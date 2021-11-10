const { Query } = require("./Query");
const { Product } = require("./Product");
const { ProductResult } = require("./ProductResult");
const { Category } = require("./Category");
const { CategoryResult } = require("./CategoryResult");
const { ReviewResult } = require("./ReviewResult");
const { Mutation } = require("./Mutation");

exports.resolvers = {
  Query,
  Product,
  Category,
  Mutation,
  CategoryResult,
  ProductResult,
  ReviewResult,
};
