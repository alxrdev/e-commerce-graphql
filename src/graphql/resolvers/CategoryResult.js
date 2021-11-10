exports.CategoryResult = {
  __resolveType(obj, context, info) {
    return obj.hasOwnProperty("invalidInputs")
      ? "InvalidInput" : "Category";
  }
};
