import { ApolloServer } from "apollo-server";
import { schema } from "./graphql";
import { db } from "./data";

const server = new ApolloServer({
  schema,
  context: {
    db,
  },
});

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
