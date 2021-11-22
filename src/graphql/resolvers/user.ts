import { Context, ErrorMessage, LoginResponse } from "graphql/types";
import * as yup from "yup";
import bcrypt from "bcrypt";
import { formatYupError } from "../utils/formatYupError";
import { createToken } from "../utils/jwtTokenHandler";

interface ILoginArguments {
  email: string
  password: string
}

type LoginResult = LoginResponse | ErrorMessage;

const userResolvers = {
  Mutation: {
    login: async (_: any, { email, password }: ILoginArguments, { db }: Context) => {
      const schema = yup.object().shape({
        email: yup.string().email().required(),
        password: yup.string().min(8).required(),
      });
  
      try {
        await schema.validate({ email, password }, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }

      const user = await db.user.findFirst({ where: { email }, include: { roles: { include: { role: true } } } });
      const checkPassword = bcrypt.compareSync(password, user ? user.password : "");

      if (!user || !checkPassword) {
        return {
          invalidInputs: [{
            message: "Invalid email/password.",
            path: "email/password",
            value: "",
          }],
        };
      }

      const roles = user.roles.map((r) => r.role);
      const token = createToken(user, roles.map((r) => r.name));

      return {
        token,
        user: {
          ...user,
          password: undefined,
          roles,
        }
      };
    },
  },
  LoginResult: {
    __resolveType: (obj: LoginResult, _: any, __: any) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "LoginResponse";
    }
  },
};

export { userResolvers };
