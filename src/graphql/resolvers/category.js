const { v4: uuid } = require("uuid");
const yup = require("yup");
const { formatYupError } = require("../utils/formatYupError");

exports.categoryResolvers = {
  Query: {
    categories: (parent, args, { db }) => db.categories,
    category: (parent, { id }, { db }) => {
      const category = db.categories.find((category) => category.id === id);
      return category;
    },
  },
  Mutation: {
    addCategory: async (parent, { input }, { db }) => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
  
      const newCategory = {
        id: uuid(),
        name: input.name,
      };
  
      db.categories.push(newCategory);
  
      return newCategory;
    },
    updateCategory: async (parent, { id, input }, { db }) => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
      
      const index = db.categories.findIndex((category) => category.id === id);
  
      if (index === -1) {
        return {
          invalidInputs: [{
            message: "Category not found.",
            path: "id",
            value: id,
          }],
        };
      }
      
      db.categories[index] = {
        ...db.categories[index],
        ...input
      };
  
      return db.categories[index];
    },
    deleteCategory: (parent, { id }, { db }) => {
      db.categories = db.categories.filter(category => category.id !== id);
      db.products = db.products.map(product => {
        if (product.categoryId === id) {
          return {
            ...product,
            categoryId: null,
          };
        } else return product;
      });
  
      return true;
    },
  },
  Category: {
    products: ({ id }, { filter }, { db }) => {
      let productsFound = db.products.filter((product) => product.categoryId === id);
  
      if (filter) {
        const { onSale, avgRating } = filter;
  
        if (onSale) {
          productsFound = productsFound.filter(product => product.onSale === true);
        }
  
        if (avgRating && [1, 2, 3, 4, 5].includes(avgRating)) {
          productsFound = productsFound.filter(product => {
            let sumRating = 0;
            let qttReviews = 0;
  
            db.reviews.forEach(review => {
              if (review.productId === product.id) {
                sumRating += review.rating;
                qttReviews++;
              }
            });
  
            const productRating = sumRating / qttReviews;
  
            return productRating >= avgRating;
          });
        }
      }
  
      return productsFound;
    },
  },
  CategoryResult: {
    __resolveType: (obj, context, info) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Category";
    }
  },
};
