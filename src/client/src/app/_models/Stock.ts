/**
 * Version of stock compliant with the api
 */
export type Stock = {
  symbol: string;
  price: number;
  totalShares: number;
  volume: number;
  risk: number;
};
