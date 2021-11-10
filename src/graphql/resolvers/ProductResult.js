exports.ProductResult = {
  __resolveType(obj, context, info) {
    return obj.hasOwnProperty("invalidInputs")
      ? "InvalidInput" : "Product";
  }
};
