import { makeExecutableSchema, IExecutableSchemaDefinition } from '@graphql-tools/schema';
import { readFileSync } from "fs";
import { join } from "path";
import { resolvers } from "./resolvers";

export const schema: IExecutableSchemaDefinition = makeExecutableSchema({
  typeDefs: readFileSync(join(__dirname, "./schemas/schema.graphql"), {
    encoding: "utf8",
  }),
  resolvers,
});
