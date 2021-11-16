import { categoryResolvers } from "./category";
import { productResolvers } from "./product";
import { reviewResolvers } from "./review";

const rootResolver = {};

const resolvers = [
  rootResolver,
  categoryResolvers,
  productResolvers,
  reviewResolvers,
];

export { resolvers };
