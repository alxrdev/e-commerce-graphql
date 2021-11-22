import { AuthenticationError } from "apollo-server-errors";
import { TokenPayload } from "./jwtTokenHandler";

export const userAuthorization = (user: TokenPayload, allowedRoles: string[] = []) => {
  if (!user || !user.id) {
    throw new AuthenticationError("User unauthorized.");
  }

  if (allowedRoles.length > 1) {
    const found = allowedRoles.filter((role) => user.roles.includes(role));
    if (found.length === 0) {
      throw new AuthenticationError("User unauthorized.");
    }
  }

  return true;
}
