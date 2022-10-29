/**
 * How a stock will be implemented in the api
 */
export type Stock = {
	symbol: string;
	price: number;
	oldPrice: number;
	shares: number;
	volume: number;
	risk: number;
};
