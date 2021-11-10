exports.ReviewResult = {
  __resolveType(obj, context, info) {
    return obj.hasOwnProperty("invalidInputs")
      ? "InvalidInput" : "Review";
  }
};
