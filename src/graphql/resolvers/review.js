const { v4: uuid } = require("uuid");
const yup = require("yup");
const { formatYupError } = require("../utils/formatYupError");

exports.reviewResolvers = {
  Query: {},
  Mutation: {
    addReview: async (parent, { input }, { db }) => {
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
        return formatYupError(error);
      }
  
      const { date, title, comment, rating, productId } = input;
      
      const product = db.products.find((product) => product.id === productId);
  
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
    updateReview: async (parent, { id, input }, { db }) => {
      const schema = yup.object().shape({
        date: yup.date().optional(),
        title: yup.string().min(1).optional(),
        comment: yup.string().min(1).optional(),
        rating: yup.number().oneOf([1, 2, 3, 4, 5]).optional(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
  
      const index = db.reviews.findIndex((review) => review.id === id);
  
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
    deleteReview: (parent, { id }, { db }) => {
      db.reviews = db.reviews.filter(review => review.id !== id);
      return true;
    },
  },
  ReviewResult: {
    __resolveType: (obj, context, info) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Review";
    }
  },
};
