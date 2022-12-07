/**
 * Version of stock compliant with the api
 */
export type Stock = {
  symbol: string;
  oldPrice: number;
  price: number;
  shares: number;
  volume: number;
  risk: number;
};
