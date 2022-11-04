/* eslint-disable max-lines-per-function -- not needed */
/* eslint-disable no-restricted-syntax -- disabled */
/* eslint-disable sonarjs/cognitive-complexity -- disabled */
/* eslint-disable max-statements -- disabled */

import { type StockMongoClient, MONGO_COMMON } from "../../mongo";
import {
	type User,
	type UserAggregateData,
	type Trade,
	type Stock,
	type OwnedStock,
	TRADE_TYPE,
} from "../../@types";

/**
 * Massive function, gathering aggregate data about the user to display in the sidebar given the **username**
 *
 * @param client - The mongo client
 * @param username - The username to grab the user info from
 * @returns The user's aggregate data
 */
export const withUsername = async (
	client: StockMongoClient,
	username: string,
): Promise<UserAggregateData | undefined> => {
	const userCollection = client
		.getClient()
		.db(MONGO_COMMON.DATABASE_NAME)
		.collection("user");
	const stockCollection = client
		.getClient()
		.db(MONGO_COMMON.DATABASE_NAME)
		.collection("stock");

	const foundUser = await userCollection.findOne<User>({ username });
	if (
		foundUser === null ||
		foundUser.portfolio?.stocks === undefined ||
		foundUser.portfolio?.trades === undefined
	) {
		return undefined;
	}

	// user exists, start generating aggregate data, organize trades by day
	const { portfolio } = foundUser;
	const { stocks, trades } = portfolio;
	const organizedTrades: { [key: string]: Trade[] } = {};

	// Gather all stock information from all traded stocks
	const allTradedStockSymbols: string[] = [];
	const findAllTradedStockPromises: Promise<Stock | null>[] = [];
	for (const eachTrade of trades) {
		const day = new Date(eachTrade.time);
		if (day.toDateString() in organizedTrades) {
			// key exists in organizedTrades
			organizedTrades[day.toDateString()].push(eachTrade);
		} else {
			organizedTrades[day.toDateString()] = [eachTrade];
		}
		if (!allTradedStockSymbols.includes(eachTrade.stockSymbol)) {
			allTradedStockSymbols.push(eachTrade.stockSymbol);
			findAllTradedStockPromises.push(
				stockCollection.findOne<Stock>({
					symbol: eachTrade.stockSymbol,
				}),
			);
		}
	}
	const allTradedStocks = await Promise.all(findAllTradedStockPromises);
	const numberStocks = stocks.length;
	const numberTrades = trades.length;
	const avgTradesPerDay = Number(
		(numberTrades / Object.keys(organizedTrades).length).toFixed(2),
	);
	const totalSpent = trades
		.filter((eachTrade: Trade) => eachTrade.type === TRADE_TYPE.BUY)
		.map((eachTrade: Trade) => eachTrade.loss)
		.reduce(
			(
				previousValue: number | undefined,
				currentValue: number | undefined,
			) => (previousValue ?? 0) + (currentValue ?? 0),
			0,
		);
	const totalProfit = trades
		.filter((eachTrade: Trade) => eachTrade.type === TRADE_TYPE.SELL)
		.map((eachTrade: Trade) => eachTrade.profit)
		.reduce(
			(
				previousValue: number | undefined,
				currentValue: number | undefined,
			) => (previousValue ?? 0) + (currentValue ?? 0),
			0,
		);
	const totalPotentialProfit = stocks
		.map((eachStock: OwnedStock) => {
			const foundStockInfo = allTradedStockSymbols.indexOf(
				eachStock.symbol,
			);
			const stockInfo = allTradedStocks[foundStockInfo];
			if (stockInfo !== null) {
				return eachStock.amount * stockInfo.price;
			}
			return 0;
		})
		.reduce(
			(previousValue: number, currentValue: number) =>
				previousValue + currentValue,
			0,
		);
	const mostProfitableDayFilter = { day: "", profit: 0 };
	const mostLossDayFilter = { day: "", loss: 0 };
	const boughtStockDictionary: { [key: string]: number } = {};
	const soldStockDictionary: { [key: string]: number } = {};

	/**
	 * Loops over all days, n, and loops over all trades within those days, k.
	 * For a total cost of O(n * k)
	 */
	for (const eachDay of Object.keys(organizedTrades)) {
		let totalProfit = 0;
		let totalLoss = 0;
		const eachDayTrades = organizedTrades[eachDay];
		// below is me basically condensing
		for (const eachTrade of eachDayTrades) {
			if (eachTrade.type === TRADE_TYPE.BUY) {
				if (eachTrade.stockSymbol in boughtStockDictionary) {
					boughtStockDictionary[eachTrade.stockSymbol] +=
						eachTrade.stockAmount;
				} else {
					boughtStockDictionary[eachTrade.stockSymbol] =
						eachTrade.stockAmount;
				}
			} else if (eachTrade.stockSymbol in soldStockDictionary) {
				soldStockDictionary[eachTrade.stockSymbol] +=
					eachTrade.stockAmount;
			} else {
				soldStockDictionary[eachTrade.stockSymbol] =
					eachTrade.stockAmount;
			}
			totalProfit += eachTrade.profit ?? 0;
			totalLoss += eachTrade.loss ?? 0;
		}
		if (totalProfit > mostProfitableDayFilter.profit) {
			mostProfitableDayFilter.profit = totalProfit;
			mostProfitableDayFilter.day = eachDay;
		}
		if (totalLoss > mostLossDayFilter.loss) {
			mostLossDayFilter.loss = totalLoss;
			mostLossDayFilter.day = eachDay;
		}
	}
	const mostProfitableDay = mostProfitableDayFilter.day;
	const mostLossDay = mostLossDayFilter.day;
	let mostBoughtStockSymbol = "";
	let mostBoughtStockAmount = 0;
	let mostSoldStockSymbol = "";
	let mostSoldStockAmount = 0;
	for (const eachBoughtStockSymbol of Object.keys(boughtStockDictionary)) {
		const amount = boughtStockDictionary[eachBoughtStockSymbol];
		if (amount > mostBoughtStockAmount) {
			mostBoughtStockAmount = amount;
			mostBoughtStockSymbol = eachBoughtStockSymbol;
		}
	}
	for (const eachSoldStockSymbol of Object.keys(soldStockDictionary)) {
		const amount = soldStockDictionary[eachSoldStockSymbol];
		if (amount > mostSoldStockAmount) {
			mostSoldStockAmount = amount;
			mostSoldStockSymbol = eachSoldStockSymbol;
		}
	}

	return {
		avgTradesPerDay,
		mostBoughtStockSymbol,
		mostLossDay,
		mostProfitableDay,
		mostSoldStockSymbol,
		numberStocks,
		numberTrades,
		totalPotentialProfit,
		totalProfit,
		totalSpent,
	};
};

export const withUsernamePotentialProfit = async (
	client: StockMongoClient,
	username: string,
): Promise<Partial<UserAggregateData> | undefined> => {
	const userCollection = client
		.getClient()
		.db(MONGO_COMMON.DATABASE_NAME)
		.collection("user");
	const stockCollection = client
		.getClient()
		.db(MONGO_COMMON.DATABASE_NAME)
		.collection("stock");

	const foundUser = await userCollection.findOne<User>({ username });
	if (foundUser === null) {
		return undefined;
	}

	// user exists, start generating aggregate data, organize trades by day
	const { portfolio } = foundUser;
	const { stocks } = portfolio;

	const allStockInformationPromises: Promise<Stock | null>[] = [];
	const allStockInformationSymbols: string[] = [];
	for (const eachOwnedStock of stocks) {
		allStockInformationPromises.push(
			stockCollection.findOne<Stock>({
				symbol: eachOwnedStock.symbol,
			}),
		);
		allStockInformationSymbols.push(eachOwnedStock.symbol);
	}

	const allStockInformation: (Stock | null)[] = await Promise.all(
		allStockInformationPromises,
	);

	const totalPotentialProfit = stocks
		.map((eachStock: OwnedStock) => {
			const foundStockInfo = allStockInformationSymbols.indexOf(
				eachStock.symbol,
			);
			const stockInfo = allStockInformation[foundStockInfo];
			if (stockInfo !== null) {
				return eachStock.amount * stockInfo.price;
			}
			return 0;
		})
		.reduce(
			(previousValue: number, currentValue: number) =>
				previousValue + currentValue,
			0,
		);
	return {
		totalPotentialProfit,
	};
};
