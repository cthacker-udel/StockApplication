/* eslint-disable sonarjs/prefer-immediate-return -- not needed */
/* eslint-disable max-statements -- not needed */
/* eslint-disable indent -- not needed */
/* eslint-disable @typescript-eslint/indent -- not needed */
/* eslint-disable no-mixed-spaces-and-tabs -- not needed */
/* eslint-disable sonarjs/cognitive-complexity -- not need */
/* eslint-disable class-methods-use-this -- not needed */
import { computeOverallValueFromPortfolio } from "../../modules";
import {
	type Stock,
	type User,
	type OwnedStock,
	type Trade,
	TRADE_TYPE,
	type LeaderboardUser,
} from "../../@types";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";

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
		const tradeCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("trade");

		const foundUser = await userCollection.findOne<User>({ username });
		const foundStock = await stockCollection.findOne<Stock>({
			symbol: stockSymbol,
		});
		if (foundUser === null || foundStock === null) {
			return false;
		}
		const { balance, portfolio } = foundUser;
		const { price, shares } = foundStock;
		const cost = price * amt;
		if (shares < amt) {
			return false;
		}
		if (cost > balance) {
			return false;
		}
		const modifiedBalance = Number(Math.round(balance - cost).toFixed(2));
		// Adding log of trade
		const tradeLog: Trade = {
			loss: Number(Math.round(cost).toFixed(2)),
			stockAmount: amt,
			stockSymbol,
			time: new Date(Date.now()),
			type: TRADE_TYPE.BUY,
			username,
		};
		const trades = [...portfolio.trades];
		trades.push(tradeLog);
		// Updating stocks
		const stocks = [...portfolio.stocks];
		const isStockAlreadyPresent = stocks.some(
			(eachStock: OwnedStock) =>
				eachStock.symbol.toLowerCase() === stockSymbol.toLowerCase(),
		);
		if (isStockAlreadyPresent) {
			// stock is already present
			const ind = stocks.findIndex(
				(eachOwnedStock: OwnedStock) =>
					eachOwnedStock.symbol.toLowerCase() ===
					stockSymbol.toLowerCase(),
			);
			stocks[ind] = { ...stocks[ind], amount: stocks[ind].amount + amt };
		} else {
			stocks.push({
				amount: amt,
				beganOwning: new Date(Date.now()),
				symbol: stockSymbol,
			});
		}
		await tradeCollection.insertOne(tradeLog);
		const userUpdateResult = await userCollection.updateOne(
			{ username },
			{
				$set: {
					balance: modifiedBalance,
					portfolio: { ...portfolio, stocks, trades },
				},
			},
		);
		const stockUpdateResult = await stockCollection.updateOne(
			{ symbol: stockSymbol },
			{
				$set: { shares: shares - amt },
			},
		);
		return userUpdateResult.acknowledged && stockUpdateResult.acknowledged;
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
		const tradeCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("trade");
		const foundUser = await userCollection.findOne<User>({ username });
		if (foundUser === null) {
			return false;
		}
		// found user
		const {
			portfolio,
			balance,
			portfolio: { trades },
		} = foundUser;

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

				const updatedStocks =
					modifiedAmount === 0
						? [...portfolio.stocks].filter(
								(eachStock: OwnedStock) =>
									eachStock.symbol !== stockSymbol,
						  )
						: [...portfolio.stocks].map((eachStock: OwnedStock) => {
								if (eachStock.symbol === stockSymbol) {
									return {
										...eachStock,
										amount: modifiedAmount,
									};
								}
								return eachStock;
						  });

				const allStocksPromise = [];
				for (const eachStock of updatedStocks) {
					allStocksPromise.push(
						stockCollection.findOne<Stock>({
							symbol: eachStock.symbol,
						}),
					);
				}
				const allStocks = await Promise.all(allStocksPromise);

				const newPortfolioBalance = allStocks
					.map((stock: Stock | null, _ind: number) => {
						if (stock === null) {
							return 0;
						}
						return updatedStocks[_ind].amount * stock.price;
					})
					.reduce(
						(element1: number, element2: number) =>
							element1 + element2,
						0,
					);

				const sellTradeEntry: Trade = {
					profit,
					stockAmount: amt,
					stockSymbol,
					time: new Date(Date.now()),
					type: TRADE_TYPE.SELL,
					username,
				};

				const modifiedBalance = balance + profit;

				const stockUpdateResult = await stockCollection.updateOne(
					{ symbol: stockSymbol },
					{
						$set: { shares: currentStock.shares + amt },
					},
				);

				await tradeCollection.insertOne(sellTradeEntry);

				const userUpdateResult = await userCollection.updateOne(
					{ username },
					{
						$set: {
							balance: modifiedBalance,
							portfolio: {
								...portfolio,
								balance: newPortfolioBalance,
								stocks: updatedStocks,
								trades: [sellTradeEntry, ...trades],
							},
						},
					},
				);
				return (
					stockUpdateResult.modifiedCount > 0 &&
					userUpdateResult.modifiedCount > 0
				);
			}
			return false;
		}
		// user is valid, and they own the stock, check the balance
		return false;
	};

	public getLeaderboardUsers = async (
		client: StockMongoClient,
	): Promise<LeaderboardUser[]> => {
		const database = client.getClient().db(MONGO_COMMON.DATABASE_NAME);
		const userCollection = database.collection<User>("user");
		const leaderboardCollection =
			database.collection<LeaderboardUser>("leaderboard");
		const allUsers = await userCollection.find<User>({}).toArray();

		const allUsersRankIndex: [
			username: string,
			index: number,
			rank: number,
		][] = allUsers.map((eachUser: User, index: number) => {
			if (eachUser.portfolio?.trades.length > 0) {
				const computedValue = computeOverallValueFromPortfolio(
					eachUser.portfolio,
				);
				return [eachUser.username, index, computedValue];
			}
			return [eachUser.username, index, eachUser.portfolio.balance];
		});

		allUsersRankIndex.sort(
			(
				array1: [username: string, index: number, rank: number],
				array2: [username: string, index: number, rank: number],
			) => {
				const user1Rank = array1[2];
				const user2Rank = array2[2];
				if (user1Rank === user2Rank) {
					return array1[0].localeCompare(array2[0]);
				}
				return user2Rank - user1Rank;
			},
		);

		const topUsers = allUsersRankIndex.slice(0, 4);
		const formattedTopUsers: LeaderboardUser[] = topUsers.map(
			(
				eachTopUser: [username: string, index: number, rank: number],
				_index: number,
			) => ({
				rank: eachTopUser[1] + 1,
				totalValue: eachTopUser[2],
				username: eachTopUser[0],
			}),
		);

		const deletionResult = await leaderboardCollection.deleteMany({});
		if (deletionResult.acknowledged) {
			const insertionResult = await leaderboardCollection.insertMany(
				formattedTopUsers,
			);
			return insertionResult.insertedCount > 0 ? formattedTopUsers : [];
		}
		return [];
	};

	public getMostRecentTrades = async (
		client: StockMongoClient,
	): Promise<Trade[]> => {
		const tradeCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection<Trade>("trade");
		const allTrades = await tradeCollection.find({}).toArray();
		const top5Trades = allTrades.slice(-5).reverse();
		return top5Trades;
	};
}
