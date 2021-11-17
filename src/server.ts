import { ApolloServer } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { schema } from "./graphql";

const db = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ]
});

db.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
})

const server = new ApolloServer({
  schema,
  context: {
    db,
  },
});

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
