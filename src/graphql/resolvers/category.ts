import { Category, ErrorMessage, InvalidInput, Product, Review } from "entities";
import { v4 as uuid } from "uuid";
import * as yup from "yup";
import { formatYupError } from "../utils/formatYupError";

interface IAddCategoryArguments {
  input: Omit<Category, "id">
}

interface IUpdateCategoryArguments {
  id: string
  input: Omit<Category, "id">
}

interface IDeleteCategoryArguments {
  id: string
}

interface IProductFiltersArguments {
  filter: {
    onSale?: boolean
    avgRating?: number
  }
}

type CategoryResult = Category | ErrorMessage;

const categoryResolvers = {
  Query: {
    categories: (_: any, __: any, { db }: any): Category[] => db.categories,
    category: (parent: any, { id }: any, { db }: any): Category => {
      const category = db.categories.find((category: Category) => category.id === id);
      return category;
    },
  },
  Mutation: {
    addCategory: async (_: any, { input }: IAddCategoryArguments, { db }: any): Promise<Category | InvalidInput> => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }
  
      const newCategory = {
        id: uuid(),
        name: input.name,
      };
  
      db.categories.push(newCategory);
  
      return newCategory;
    },
    updateCategory: async (_: any, { id, input }: IUpdateCategoryArguments, { db }: any): Promise<Category | InvalidInput> => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }
      
      const index = db.categories.findIndex((category: Category) => category.id === id);
  
      if (index === -1) {
        return {
          invalidInputs: [{
            message: "Category not found.",
            path: "id",
            value: id, 
          }],
        };
      }
      
      db.categories[index] = {
        ...db.categories[index],
        ...input
      };
  
      return db.categories[index];
    },
    deleteCategory: (_: any, { id }: IDeleteCategoryArguments, { db }: any): boolean => {
      db.categories = db.categories.filter((category: Category) => category.id !== id);
      db.products = db.products.map((product: Product) => {
        if (product.categoryId === id) {
          return {
            ...product,
            categoryId: null,
          };
        } else return product;
      });
  
      return true;
    },
  },
  Category: {
    products: ({ id }: Category, { filter }: IProductFiltersArguments, { db }: any): Product[] => {
      let productsFound = db.products.filter((product: Product) => product.categoryId === id);
  
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
  },
  CategoryResult: {
    __resolveType: (obj: CategoryResult, _: any, __: any) => {
      return obj.hasOwnProperty("invalidInputs")
        ? "InvalidInput" : "Category";
    }
  },
};

export { categoryResolvers };
