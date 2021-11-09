exports.Category = {
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
};
