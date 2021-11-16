import { Category, ErrorMessage, InvalidInput, Product, Review } from "entities";
import { v4 as uuid } from "uuid";
import * as yup from "yup";
import { formatYupError } from "../utils/formatYupError";

interface IProductFiltersArguments {
  filter: {
    onSale?: boolean
    avgRating?: number
  }
}

interface IProductArguments {
  id: string
}

interface IAddProductArguments {
  input: Omit<Product, "id">
}

interface IUpdateProductArguments {
  id: string
  input: Partial<Omit<Product, "id">>
}

interface IDeleteProductArguments {
  id: string
}

type ProductResult = Product | ErrorMessage;

const productResolvers = {
  Query: {
    products: (_: any, { filter }: IProductFiltersArguments, { db }: any): Product[] => {
      let productsFound = db.products;
  
      if (filter) {
        const { onSale, avgRating } = filter;
  
        if (onSale) {
          productsFound = productsFound.filter((product: Product) => product.onSale === true);
        }
  
        if (avgRating && [1, 2, 3, 4, 5].includes(avgRating)) {
          productsFound = productsFound.filter((product: Product) => {
            let sumRating = 0;
            let qttReviews = 0;
  
            db.reviews.forEach((review: Review) => {
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
    product: (_: any, { id }: IProductArguments, { db }: any): Product => {
      const product = db.products.find((product: Product) => product.id === id);
      return product;
    },
  },
  Mutation: {
    addProduct: async (_: any, { input }: IAddProductArguments, { db }: any): Promise<Product | InvalidInput> => {
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
        return formatYupError(error as yup.ValidationError);
      }
  
      const { name, description, image, price, quantity, onSale, categoryId } = input;
  
      if (categoryId) {
        const category = db.categories.find((category: Category) => category.id === categoryId);
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
    updateProduct: async (_: any, { id, input }: IUpdateProductArguments, { db }: any): Promise<Product | InvalidInput> => {
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
        return formatYupError(error as yup.ValidationError);
      }
  
      const index = db.products.findIndex((product: Product) => product.id === id);
  
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
        const category = db.categories.find((category: Category) => category.id === categoryId);
  
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
    deleteProduct: (_: any, { id }: IDeleteProductArguments, { db }: any): boolean => {
      db.products = db.products.filter((product: Product) => product.id !== id);
      db.reviews = db.reviews.filter((review: Review) => review.productId !== id);
      return true;
    },
  },
  Product: {
    category: ({ categoryId }: Product, _: any, { db }: any): Category => {
      const category = db.categories.find((category: Category) => category.id === categoryId);    
      return category;
    },
    reviews: ({ id }: Product, _: any, { db }: any): Review[] => {
      const reviewsFound = db.reviews.filter((review: Review) => review.productId === id);
      return reviewsFound;
    },
  },
  ProductResult: {
    __resolveType: (obj: ProductResult, _: any, __: any) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Product";
    }
  },
};

export { productResolvers };
