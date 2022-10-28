/* eslint-disable sonarjs/cognitive-complexity -- not need */
/* eslint-disable class-methods-use-this -- not needed */
import type { Stock, User } from "@types";
import { type Trade, TRADE_TYPE } from "../../@types/api/trade/Trade";
import { MONGO_COMMON, type StockMongoClient } from "mongo";
import type { OwnedStock } from "../../@types/api/stock/OwnedStock";

export class TradeService {
	public buyStock = async (
		client: StockMongoClient,
		amt: number,
		stockSymbol: string,
		username: string,
	): Promise<boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("user");
		const stockCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("stock");
		const foundUser = await userCollection.findOne<User>({ username });
		const foundStock = await stockCollection.findOne<Stock>({
			symbol: stockSymbol,
		});
		if (foundUser === null || foundStock === null) {
			return false;
		}
		const { balance, portfolio } = foundUser;
		const { price, totalShares } = foundStock;
		const cost = price * amt;
		if (totalShares < amt) {
			return false;
		}
		if (cost > balance) {
			return false;
		}
		const modifiedBalance = balance - cost;
		const tradeLog: Trade = {
			loss: cost,
			stockAmount: amt,
			time: new Date(Date.now()),
			type: TRADE_TYPE.BUY,
		};
		const trades = [...portfolio.trades];
		trades.push(tradeLog);
		await userCollection.updateOne(
			{ username },
			{ balance: modifiedBalance, portfolio: trades },
		);
		await stockCollection.updateOne(
			{ symbol: stockSymbol },
			{
				totalShares: totalShares - amt,
			},
		);
		return true;
	};

	public sellStock = async (
		client: StockMongoClient,
		amt: number,
		stockSymbol: string,
		username: string,
	): Promise<boolean> => {
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
			return false;
		}
		// found user
		const { portfolio, balance } = foundUser;
		const isStockOwned = portfolio.stocks.some(
			(eachOwnedStock: OwnedStock) =>
				eachOwnedStock.symbol === stockSymbol,
		);

		if (isStockOwned) {
			const foundStock = portfolio.stocks.find(
				(eachOwnedStock: OwnedStock) =>
					eachOwnedStock.symbol === stockSymbol,
			);
			if (foundStock) {
				const { amount: foundStockAmt } = foundStock;
				if (foundStockAmt < amt) {
					// not enough amount available to sell
					return false;
				}
				// has enough amount, execute transaction
				const modifiedAmount = foundStockAmt - amt;
				const currentStock = await stockCollection.findOne<Stock>({
					symbol: stockSymbol,
				});
				if (currentStock === null) {
					// stock does not exist
					return false;
				}
				const profit = currentStock.price * amt;
				const updatedStocks = [...portfolio.stocks].filter(
					(eachOwnedStock: OwnedStock) =>
						(() => {
							if (
								eachOwnedStock.symbol === stockSymbol &&
								modifiedAmount !== 0
							) {
								return eachOwnedStock;
							}
						})() !== undefined,
				);
				const modifiedBalance = balance + profit;
				await stockCollection.updateOne(
					{ symbol: stockSymbol },
					{
						totalShares: currentStock.totalShares + amt,
					},
				);
				await userCollection.updateOne(
					{ username },
					{
						balance: modifiedBalance,
						portfolio: { ...portfolio, stocks: updatedStocks },
					},
				);
			}
			return false;
		}
		// user is valid, and they own the stock, check the balance
		return false;
	};
}
