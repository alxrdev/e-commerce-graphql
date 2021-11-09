const { UserInputError } = require("apollo-server");
const { v4: uuid } = require("uuid");

exports.Mutation = {
  addCategory: (parent, { input }, { db }) => {
    const { name } = input;    
    const newCategory = {
      id: uuid(),
      name,
    };

    db.categories.push(newCategory);

    return newCategory;
  },
  updateCategory: (parent, { id, input }, { db }) => {
    const index = db.categories.findIndex((category) => category.id === id);

    if (index === -1) {
      throw new UserInputError("Invalid argument for id field. Category not found.", {
        argumentName: "id",
      });
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


  addProduct: (parent, { input }, { db }) => {
    const { name, description, image, price, quantity, onSale, categoryId } = input;

    if (input.quantity < 0) {
      throw new UserInputError("Invalid argument for quantity field. The quantity must be greater than or equal to 0.", {
        argumentName: "quantity",
      });
    }

    if (input.price < 0) {
      throw new UserInputError("Invalid argument for price field. The price must be greater than or equal to 0.", {
        argumentName: "price",
      });
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
  updateProduct: (parent, { id, input }, { db }) => {
    const index = db.products.findIndex((product) => product.id === id);

    if (index === -1) {
      throw new UserInputError("Invalid argument for id field. Product not found.", {
        argumentName: "id",
      });
    }

    if (input.hasOwnProperty("quantity") && input.quantity < 0) {
      throw new UserInputError("Invalid argument for quantity field. The quantity must be greater than or equal to 0.", {
        argumentName: "quantity",
      });
    }

    if (input.hasOwnProperty("price") && input.price < 0) {
      throw new UserInputError("Invalid argument for price field. The price must be greater than or equal to 0.", {
        argumentName: "price",
      });
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


  addReview: (parent, { input }, { db }) => {
    const { date, title, comment, rating, productId } = input;
    
    const product = db.products.find((product) => product.id === productId);

    if (!product) {
      throw new UserInputError("Invalid argument for productId field. Product not found.", {
        argumentName: "productId",
      });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      throw new UserInputError("Invalid argument for rating field. The rating value must be between: 1, 2, 3, 4 and 5.", {
        argumentName: "rating",
      });
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
  updateReview: (parent, { id, input }, { db }) => {
    const index = db.reviews.findIndex((review) => review.id === id);

    if (index === -1) {
      throw new UserInputError("Invalid argument for id field. Review not found.", {
        argumentName: "id",
      });
    }

    if (input.hasOwnProperty("rating") && ![1, 2, 3, 4, 5].includes(input.rating)) {
      throw new UserInputError("Invalid argument for rating field. The rating value must be between: 1, 2, 3, 4 and 5.", {
        argumentName: "rating",
      });
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