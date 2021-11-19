import { Category, Product, Review } from ".prisma/client";
import { Context, ErrorMessage, InvalidInput } from "graphql/types";
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
    products: async (_: any, { filter }: IProductFiltersArguments, { db }: Context): Promise<Product[] | undefined> => {
      if (filter) {
        const { onSale, avgRating } = filter;

        if (avgRating && [1, 2, 3, 4, 5].includes(avgRating)) {
          let params: any[] = [avgRating];
          let query = `
            SELECT
              p.*, AVG(COALESCE(r.rating, 0)) AS rating
            FROM
              "public"."Product" p
            LEFT JOIN
              "public"."Review" r ON p.id = r."productId"
            WHERE
              rating >= $1
          `;

          if (onSale !== null && onSale !== undefined
              && [true, false].includes(onSale)) {
            query += `
              AND
                "onSale" = $2
            `;
            params.push(onSale);
          }

          query += `
            GROUP BY
              p.id
            ORDER BY
              rating
            DESC
          `;

          const products: Product[] = await db.$queryRawUnsafe(
            query,
            ...params
          );

          return products;
        }

        let query = {} as { onSale?: boolean };

        if (onSale !== null && onSale !== undefined
          && [true, false].includes(onSale)) {
          query.onSale = onSale;
        }

        const products: Product[] = await db.product.findMany({ where: query });
        return products
      }
      
      const products: Product[] = await db.product.findMany();
      return products;
    },
    product: async (_: any, { id }: IProductArguments, { db }: Context): Promise<Product | null | undefined> => {
      const product = db.product.findFirst({ where: { id } });
      return product;
    },
  },
  Mutation: {
    addProduct: async (_: any, { input }: IAddProductArguments, { db }: Context): Promise<Product | InvalidInput> => {
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
        const category = await db.category.findFirst({ where: { id: categoryId } });
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

      const product = db.product.create({
        data: {
          name,
          description,
          image,
          price,
          quantity,
          onSale,
          categoryId
        }
      });
  
      return product;
    },
    updateProduct: async (_: any, { id, input }: IUpdateProductArguments, { db }: Context): Promise<Product | InvalidInput> => {
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
      
      const product = db.product.findFirst({ where: { id } });
  
      if (!product) {
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
        const category = await db.category.findFirst({ where: { id: categoryId } });
  
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
      
      const updatedProduct = db.product.update({
        where: { id },
        data: { ...input }
      });
      
      return updatedProduct;
    },
    deleteProduct: async (_: any, { id }: IDeleteProductArguments, { db }: Context): Promise<boolean> => {
      await db.review.deleteMany({ where: { productId: id } });
      await db.product.delete({ where: { id } });
      return true;
    },
  },
  Product: {
    category: async ({ id }: Product, _: any, { db }: Context): Promise<Category | null> => {
      const category = db.product.findUnique({ where: { id } }).category();
      return category;
    },
    reviews: async ({ id }: Product, _: any, { db }: Context): Promise<Review[]> => {
      const reviewsFound = db.product.findUnique({ where: { id } }).reviews();
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
