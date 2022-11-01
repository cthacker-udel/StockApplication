export type UserAggregateData = {
	numberStocks?: number;
	numberTrades?: number;
	avgTradesPerDay?: number;
	totalSpent?: number;
	totalProfit?: number;
	totalPotentialProfit?: number;
	mostProfitableDay?: string;
	mostLossDay?: string;
	mostBoughtStockSymbol?: string;
	mostSoldStockSymbol?: string;
};
