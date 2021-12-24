import { ApolloServer, AuthenticationError } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import { schema } from "./graphql";
import { decodeToken, TokenPayload } from "./graphql/utils/jwtTokenHandler";

const db = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
  ]
});

db.$on('query', (e: any) => {
  console.log('Query: ' + e.query)
  console.log('Duration: ' + e.duration + 'ms')
});

const server = new ApolloServer({
  schema,
  context: ({ req }) => {    
    let tokenPayload: TokenPayload | undefined;

    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace("Bearer ", "");
        tokenPayload = decodeToken(token);
      } catch (err) {
        throw new AuthenticationError("User unauthorized.");
      }
    }

    return {
      db,
      user: tokenPayload,
    }
  },
});

server.listen().then(({ url }) => {
  console.log("Server is ready at " + url);
});
