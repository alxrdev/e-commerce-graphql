exports.formatYupError = (error) => {
  const errors = error.inner.map((e) => {
    return {
      message: e.message,
      path: e.path,
      value: e.value,
    };
  });

  return {
    invalidInputs: errors,
  };
};
