exports.Product = {
  category: ({ categoryId }, args, { db }) => {
    const category = db.categories.find((category) => category.id === categoryId);    
    return category;
  },
  reviews: ({ id }, args, { db }) => {
    const reviewsFound = db.reviews.filter((review) => review.productId === id);
    return reviewsFound;
  },
};
