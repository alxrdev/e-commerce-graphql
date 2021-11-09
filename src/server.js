const { ApolloServer } = require("apollo-server");
const { typeDefs, resolvers } = require("./graphql");
const { db } = require("./data");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: {
    db,
  },
});

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
