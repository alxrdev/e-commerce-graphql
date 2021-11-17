import { Category, Product, Review } from ".prisma/client";
import { Context, ErrorMessage, InvalidInput } from "graphql/types";
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
    categories: async (_: any, __: any, { db }: Context): Promise<Category[] | undefined> => {
      const category = db.category.findMany();
      return category;
    },
    category: async (_: any, { id }: any, { db }: Context): Promise<Category | null | undefined> => {
      const category = db.category.findFirst({ where: { id } });
      return category;
    },
  },
  Mutation: {
    addCategory: async (_: any, { input }: IAddCategoryArguments, { db }: Context): Promise<Category | InvalidInput> => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }

      const category = db.category.create({ data: { name: input.name } });

      return category;
    },
    updateCategory: async (_: any, { id, input }: IUpdateCategoryArguments, { db }: Context): Promise<Category | InvalidInput> => {
      const schema = yup.object().shape({
        name: yup.string().required(),
      });
  
      try {
        await schema.validate(input, { abortEarly: false });
      } catch (error) {
        return formatYupError(error as yup.ValidationError);
      }
      
      const category = await db.category.findFirst({ where: { id } });
  
      if (!category) {
        return {
          invalidInputs: [{
            message: "Category not found.",
            path: "id",
            value: id, 
          }],
        };
      }
      
      category.name = input.name;

      await db.category.update({ where: { id }, data: { name: category.name } });
  
      return category;
    },
    deleteCategory: async (_: any, { id }: IDeleteCategoryArguments, { db }: Context): Promise<boolean> => {
      await db.product.updateMany({ where: { categoryId: id }, data: { categoryId: "" } });
      await db.category.delete({ where: { id } });
        
      return true;
    },
  },
  Category: {
    products: async ({ id }: Category, { filter }: IProductFiltersArguments, { db }: Context): Promise<Product[]> => {
      let query = {} as { onSale?: boolean };
      let productsFound: Product[] = [];
  
      if (filter) {
        const { onSale, avgRating } = filter;
  
        if (onSale) {
          query.onSale = true;
        }

        productsFound = await db.category
          .findUnique({ where: { id } })
          .products({ where: query });
  
        if (avgRating && [1, 2, 3, 4, 5].includes(avgRating)) {
          const validProducts = [];

          for (const product of productsFound) {
            let sumRating = 0;
            let qttReviews = 0;
  
            const reviews = await db.product
              .findUnique({ where: { id: product.id } })
              .reviews();
            
            reviews.forEach((review: Review) => {
              sumRating += review.rating;
              qttReviews++;
            });
  
            const productRating = sumRating !== 0 && qttReviews !== 0
              ? sumRating / qttReviews
              : 0;
  
            if (productRating >= avgRating) {
              validProducts.push(product);
            }
          }

          productsFound = validProducts;
        }
      } else {
        productsFound = await db.category
          .findUnique({ where: { id } })
          .products({ where: query });
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
