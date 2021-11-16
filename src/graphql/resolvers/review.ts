import { ErrorMessage, InvalidInput, Product, Review } from "entities";
import { v4 as uuid } from "uuid";
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
    addReview: async (_: any, { input }: IAddReviewArguments, { db }: any): Promise<Review | InvalidInput> => {
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
  
      const { date, title, comment, rating, productId } = input;
      
      const product = db.products.find((product: Product) => product.id === productId);
  
      if (!product) {
        return {
          invalidInputs: [{
            message: "Product not found.",
            path: "productId",
            value: productId,
          }],
        };
      }
  
      const newReview = {
        id: uuid(),
        date,
        title,
        comment,
        rating,
        productId,
      };
  
      db.reviews.push(newReview);
  
      return newReview;
    },
    updateReview: async (_: any, { id, input }: IUpdateReviewArguments, { db }: any): Promise<Review | InvalidInput> => {
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
  
      const index = db.reviews.findIndex((review: Review) => review.id === id);
  
      if (index === -1) {
        return {
          invalidInputs: [{
            message: "Review not found.",
            path: "id",
            value: id,
          }],
        };
      }
      
      db.reviews[index] = {
        ...db.reviews[index],
        ...input
      };
      
      return db.reviews[index];
    },
    deleteReview: (_: any, { id }: IDeleteReviewArguments, { db }: any): boolean => {
      db.reviews = db.reviews.filter((review: Review) => review.id !== id);
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
