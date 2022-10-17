/* eslint-disable class-methods-use-this -- not needed for this method, maybe as more get added we can include this */
import type { StockApiStatus } from "../../@types";
import type { StockMongoClient } from "../../mongo";

export class StatusService {
	public getStatus = (client: StockMongoClient): StockApiStatus => ({
		mongo: client.isConnected() ? "online" : "offline",
	});

	public getOfflineStatus = (): StockApiStatus => ({
		mongo: "offline",
	});
}
