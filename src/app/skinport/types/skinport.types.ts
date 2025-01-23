export type SkinportItemRaw = {
  market_hash_name: string;
  currency: string;
  suggested_price: number;
  item_page: string;
  market_page: string;
  min_price: number;
  max_price: number;
  mean_price: number;
  median_price: number;
  quantity: number;
  created_at: number;
  updated_at: number;
};

export type SkinportItem = {
  hashName: string;
  minPrice: number;
  minPriceTradable: number;
};
