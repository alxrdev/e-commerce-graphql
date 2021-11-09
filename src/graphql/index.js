const { join } = require("path");
const { readFileSync } = require("fs");
const { resolvers } = require("./resolvers");

const typeDefs = readFileSync(join(__dirname, "./schema.graphql"), {
  encoding: "utf8",
});

module.exports = { typeDefs, resolvers };
