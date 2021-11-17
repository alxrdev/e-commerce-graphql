import { Review } from ".prisma/client";
import { Context, ErrorMessage, InvalidInput } from "graphql/types";
import * as yup from "yup";
import { formatYupError } from "../utils/formatYupError";

interface IAddReviewArguments {
  input: Omit<Review, "id">
}

interface IUpdateReviewArguments {
  id: string
  input: Partial<Omit<Review, "id">>
}

interface IDeleteReviewArguments {
  id: string
}

type ReviewResult = Review | ErrorMessage;

const reviewResolvers = {
  Query: {},
  Mutation: {
    addReview: async (_: any, { input }: IAddReviewArguments, { db }: Context): Promise<Review | InvalidInput> => {
      const schema = yup.object().shape({
        date: yup.date().required(),
        title: yup.string().required(),
        comment: yup.string().required(),
        rating: yup.number().oneOf([1, 2, 3, 4, 5]).required(),
        productId: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }
  
      const { productId } = input;
      
      const product = await db.product.findFirst({ where: { id: productId } });
  
      if (!product) {
        return {
          invalidInputs: [{
            message: "Product not found.",
            path: "productId",
            value: productId,
          }],
        };
      }

      const review = db.review.create({ data: { ...input }});
  
      return review;
    },
    updateReview: async (_: any, { id, input }: IUpdateReviewArguments, { db }: Context): Promise<Review | InvalidInput> => {
      const schema = yup.object().shape({
        date: yup.date().optional(),
        title: yup.string().min(1).optional(),
        comment: yup.string().min(1).optional(),
        rating: yup.number().oneOf([1, 2, 3, 4, 5]).optional(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }
  
      const review = await db.review.findFirst({ where: { id } });
  
      if (!review) {
        return {
          invalidInputs: [{
            message: "Review not found.",
            path: "id",
            value: id,
          }],
        };
      }
      
      const updatedReview = db.review.update({
        where: { id },
        data: { ...input }
      });
      
      return updatedReview;
    },
    deleteReview: async (_: any, { id }: IDeleteReviewArguments, { db }: Context): Promise<boolean> => {
      await db.review.delete({ where: { id } });
      return true;
    },
  },
  ReviewResult: {
    __resolveType: (obj: ReviewResult, _: any, __: any) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Review";
    }
  },
};

export { reviewResolvers };
