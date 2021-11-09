exports.Query = {
  hello: () => "Hello World!!",

  // Products
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
  
  // Categories
  categories: (parent, args, { db }) => db.categories,
  category: (parent, { id }, { db }) => {
    const category = db.categories.find((category) => category.id === id);
    return category;
  },
};
