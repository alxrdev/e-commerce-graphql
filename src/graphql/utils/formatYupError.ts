import { ErrorMessage, InvalidInput } from "../types";
import { ValidationError } from "yup";

const formatYupError = (error: ValidationError) => {
  const errors: ErrorMessage[] = error.inner.map((e) => {
    return {
      message: e.message,
      path: e.path,
      value: e.value,
    };
  });

  return {
    invalidInputs: errors,
  } as InvalidInput;
};

export { formatYupError };
