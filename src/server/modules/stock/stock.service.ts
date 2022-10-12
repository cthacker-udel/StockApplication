import { type Collection, ObjectId } from "mongodb";
import type { Stock } from "server/@types";
import { BaseService } from "server/common/api/baseservice";
import { MONGO_COMMON, type StockMongoClient } from "server/mongo";

export class StockService extends BaseService {
	public constructor() {
		super("stock");
	}

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
}
