const { v4: uuid } = require("uuid");
const yup = require("yup");
const { formatYupError } = require("../utils/formatYupError");

exports.productResolvers = {
  Query: {
    products: (parent, { filter }, { db }) => {
      let productsFound = db.products;
  
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
    product: (parent, { id }, { db }) => {
      const product = db.products.find((product) => product.id === id);
      return product;
    },
  },
  Mutation: {
    addProduct: async (parent, { input }, { db }) => {
      const schema = yup.object().shape({
        name: yup.string().required(),
        description: yup.string().required(),
        image: yup.string().required(),
        price: yup.number().min(0).required(),
        quantity: yup.number().min(0).required(),
        onSale: yup.boolean().required(),
        categoryId: yup.string().optional(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
  
      const { name, description, image, price, quantity, onSale, categoryId } = input;
  
      if (categoryId) {
        const category = db.categories.find((category) => category.id === categoryId);
        if (!category) {
          return {
            invalidInputs: [{
              message: "Category not found.",
              path: "categoryId",
              value: categoryId,
            }],
          };
        }
      }
  
      const newProduct = {
        id: uuid(),
        name,
        description,
        image,
        price,
        quantity,
        onSale,
        categoryId,
      };
  
      db.products.push(newProduct);
  
      return newProduct;
    },
    updateProduct: async (parent, { id, input }, { db }) => {
      const schema = yup.object().shape({
        name: yup.string().min(1).optional(),
        description: yup.string().min(1).optional(),
        image: yup.string().min(1).optional(),
        price: yup.number().min(0).optional(),
        quantity: yup.number().min(0).optional(),
        onSale: yup.boolean().optional(),
        categoryId: yup.string().optional(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error);
      }
  
      const index = db.products.findIndex((product) => product.id === id);
  
      if (index === -1) {
        return {
          invalidInputs: [{
            message: "Product not found.",
            path: "id",
            value: id,
          }],
        };
      }
  
      if (input.categoryId) {
        const { categoryId } = input;
        const category = db.categories.find((category) => category.id === categoryId);
  
        if (!category) {
          return {
            invalidInputs: [{
              message: "Category not found.",
              path: "categoryId",
              value: categoryId,
            }],
          };
        }
      }
      
      db.products[index] = {
        ...db.products[index],
        ...input
      };
      
      return db.products[index];
    },
    deleteProduct: (parent, { id }, { db }) => {
      db.products = db.products.filter(product => product.id !== id);
      db.reviews = db.reviews.filter(review => review.productId !== id);
      return true;
    },
  },
  Product: {
    category: ({ categoryId }, args, { db }) => {
      const category = db.categories.find((category) => category.id === categoryId);    
      return category;
    },
    reviews: ({ id }, args, { db }) => {
      const reviewsFound = db.reviews.filter((review) => review.productId === id);
      return reviewsFound;
    },
  },
  ProductResult: {
    __resolveType: (obj, context, info) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Product";
    }
  },
};
