import { User } from ".prisma/client";
import jsonWebToken from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "secret";

export type TokenPayload = {
  id: string
  name: string
  email: string
  roles: string[]
}

export const createToken = (user: User, roles: string[]): string => {
  const token = jsonWebToken.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
    },
    jwtSecret,
    {}
  )

  return token;
}

export const decodeToken = (token: string): TokenPayload => {
  const decoded = jsonWebToken.verify(token ?? '', jwtSecret, { ignoreExpiration: true });
  return decoded as TokenPayload;
}
