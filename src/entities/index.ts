export type Category = {
  id: string
  name: string
};

export type Product = {
  id: string
  name: string
  description: string
  quantity: number
  price: number
  image: string
  onSale: boolean
  categoryId: string
};

export type Review = {
  id: string
  date: string
  title: string
  comment: string
  rating: number
  productId: string
};

export type ErrorMessage = {
  message: String
  path?: String
  value?: String
};

export type InvalidInput = {
  invalidInputs: ErrorMessage[]
};
