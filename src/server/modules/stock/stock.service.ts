import { type Collection, ObjectId, type InsertOneResult } from "mongodb";
import type { SortByOptions, Stock, User } from "../../@types";
import { BaseService } from "../../common";
import { MONGO_COMMON, type StockMongoClient } from "../../mongo";

/**
 * Executes all database logic dependent on which request is sent to the server
 */
export class StockService extends BaseService {
	public constructor() {
		super("stock");
	}

	/**
	 * Fetches a stock with matching `stockId` from the database
	 *
	 * @param client - The MongoClient instance
	 * @param stockId - The id of the stock
	 * @returns - The found stock or undefined if not found
	 */
	public getStockById = async (
		client: StockMongoClient,
		stockId = "",
	): Promise<Stock | undefined> => {
		let stock: Stock | undefined;
		if (stockId && client.isConnected()) {
			const stockCollection: Collection = client
				.getClient()
				.db(MONGO_COMMON.DATABASE_NAME)
				.collection(this.COLLECTION_NAME);
			stock =
				(await stockCollection.findOne<Stock>({
					_id: new ObjectId(stockId),
				})) ?? undefined;
		}
		return stock;
	};

	/**
	 * Finds a stock given the stock symbol
	 *
	 * @param client - The mongo client
	 * @param symbol - The symbol of the stock
	 * @returns The found stock
	 */
	public getStockBySymbol = async (
		client: StockMongoClient,
		symbol: string,
	): Promise<Stock | undefined> => {
		let stock: Stock | undefined;
		if (symbol && client.isConnected()) {
			const stockCollection: Collection = client
				.getClient()
				.db(MONGO_COMMON.DATABASE_NAME)
				.collection(this.COLLECTION_NAME);
			const stock = await stockCollection.findOne<Stock>({ symbol });
			if (stock) {
				return stock;
			}
		}
		return stock;
	};

	/**
	 * Finds all stocks with the given price
	 *
	 * @param client - The mongo client
	 * @param price - The price to filter the stocks by
	 * @returns The found stocks
	 */
	public getAllStocksWithPrice = async (
		client: StockMongoClient,
		price: number,
	): Promise<Stock[] | undefined> => {
		// eslint-disable-next-line sonarjs/prefer-immediate-return -- not needed
		const stocks = await client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME)
			.find<Stock>({ price })
			.toArray();
		return stocks;
	};

	/**
	 * Finds a stock given the stock symbol
	 *
	 * @param client - The mongo client
	 * @param name - The name of the stock
	 * @returns The found stock
	 */

	public getStocksByName = async (
		client: StockMongoClient,
		name: string,
	): Promise<Stock | undefined> => {
		let stock: Stock | undefined;
		if (name && client.isConnected()) {
			const stockCollection: Collection = client
				.getClient()
				.db(MONGO_COMMON.DATABASE_NAME)
				.collection(this.COLLECTION_NAME);
			const stock = await stockCollection.findOne<Stock>({ name });
			if (stock) {
				return stock;
			}
		}
		return stock;
	};

	/**
	 * Finds a stock given the stock symbol
	 *
	 * @param client - The mongo client
	 * @param shares - The number of shares to filter the stocks by
	 * @returns The found stock
	 */

	public getStocksWithShares = async (
		client: StockMongoClient,
		shares: number,
	): Promise<Stock[] | undefined> => {
		// eslint-disable-next-line sonarjs/prefer-immediate-return -- not needed
		const stocks = await client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME)
			.find<Stock>({ shares })
			.toArray();
		return stocks;
	};

	/**
	 * Fetches all stocks in the database
	 *
	 * @param client - The mongo client
	 * @returns All stocks in the database
	 */
	public getAllStocks = async (
		client: StockMongoClient,
		amt = 10,
	): Promise<Stock[] | undefined> => {
		// eslint-disable-next-line sonarjs/prefer-immediate-return -- not needed
		const allStocks = await client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME)
			.find<Stock>({})
			.limit(amt)
			.toArray();
		return allStocks;
	};

	/**
	 * The specific usage of the stock dashboard stocks, where we display the most
	 * profitable stocks, according to our calculations
	 *
	 * @param client - The mongo client
	 * @returns - An array of 3 of the most profitable stocks
	 */
	public getStockDashboardStocks = async (
		client: StockMongoClient,
		sortOption: SortByOptions = "volume",
	): Promise<Stock[] | undefined> => {
		const stockCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		// eslint-disable-next-line sonarjs/prefer-immediate-return -- not needed
		const stockCursor = await stockCollection
			.find<Stock>({})
			.sort(sortOption, "descending")
			.limit(3)
			.toArray();
		return stockCursor;
	};

	/**
	 * Adds a stock to the database
	 *
	 * @param client - The MongoClient instance
	 * @param stockPayload - The stock to add to the database
	 * @returns - Whether or not the stock was added
	 */
	public addStock = async (
		client: StockMongoClient,
		stockPayload: Stock,
	): Promise<boolean> => {
		const stockCollection: InsertOneResult = await client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME)
			.insertOne(stockPayload);
		return stockCollection.acknowledged;
	};

	/**
	 * Deletes a stock to the database
	 *
	 * @param client - The MongoClient instance
	 * @param stockPayload - The stock to add to the database
	 * @returns - Whether or not the stock was deleted
	 */

	public deleteStock = async (
		client: StockMongoClient,
		symbol: string,
	): Promise<boolean> => {
		const userCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection("user");
		const stockCollection = client
			.getClient()
			.db(MONGO_COMMON.DATABASE_NAME)
			.collection(this.COLLECTION_NAME);
		const usersWithStock = await userCollection
			.find<User>({
				portfolio: { stocks: { $elemMatch: { symbol } } },
			})
			.toArray();
		console.log(usersWithStock);
		return false;
	};
}
