const { UserInputError } = require("apollo-server");
const { v4: uuid } = require("uuid");
const yup = require("yup");
const { formatYupError } = require("../utils/formatYupError");

exports.Mutation = {
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
}