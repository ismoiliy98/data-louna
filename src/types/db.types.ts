export type User = {
  id: number;
  username: string;
  password_hash: string;
  balance: number;
};

export type Products = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type Purchases = {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  purchase_date: number;
  total_price: number;
};
