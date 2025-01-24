export type User = {
  id: number;
  username: string;
  password_hash: string;
  balance: number;
};

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export type Purchase = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  purchase_date: number;
  total_price: number;
};
