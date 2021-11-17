import { PrismaClient } from ".prisma/client";

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
}