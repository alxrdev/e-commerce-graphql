import { PrismaClient, User } from ".prisma/client";
import { TokenPayload } from "graphql/utils/jwtTokenHandler";

export type ErrorMessage = {
  message: String
  path?: String
  value?: String
};

export type InvalidInput = {
  invalidInputs: ErrorMessage[]
};

export type Context = {
  db: PrismaClient
  user: TokenPayload
}

export type LoginResponse = {
  token: string
  user: User
}
