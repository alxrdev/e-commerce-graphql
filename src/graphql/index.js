const { makeExecutableSchema } = require('@graphql-tools/schema');
const { readFileSync } = require("fs");
const { join } = require("path");
const { resolvers } = require("./resolvers");

const schema = makeExecutableSchema({
  typeDefs: readFileSync(join(__dirname, "./schemas/schema.graphql"), {
    encoding: "utf8",
  }),
  resolvers,
});

module.exports = { schema };
