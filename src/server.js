const { ApolloServer } = require("apollo-server");
const { schema } = require("./graphql");
const { db } = require("./data");

const server = new ApolloServer({
  schema,
  context: {
    db,
  },
});

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
