import { type Collection, ObjectId, type InsertOneResult } from "mongodb";
import type { Stock } from "server/@types";
import { BaseService } from "server/common/api/baseservice";
import { MONGO_COMMON, type StockMongoClient } from "server/mongo";

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
	public getStock = async (
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
}
