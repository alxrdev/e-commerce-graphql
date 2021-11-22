import { categoryResolvers } from "./category";
import { productResolvers } from "./product";
import { reviewResolvers } from "./review";
import { userResolvers } from "./user";

const rootResolver = {};

const resolvers = [
  rootResolver,
  categoryResolvers,
  productResolvers,
  reviewResolvers,
  userResolvers,
];

export { resolvers };
