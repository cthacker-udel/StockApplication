import type { Stock } from "../../@types";

export const processStocksForDashboard = (stocks: Stock[]) => {
	stocks.sort((stock1: Stock, stock2: Stock) => {
		const stock1Diff = stock1.price - stock1.oldPrice;
		const stock2Diff = stock2.price - stock1.oldPrice;
		return stock1Diff - stock2Diff;
	});
};
