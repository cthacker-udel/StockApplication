/* eslint-disable class-methods-use-this -- not needed for this method, maybe as more get added we can include this */
import type { RedisClientType } from "redis";
import type { StockApiStatus } from "../../@types";
import type { StockMongoClient } from "../../mongo";

export class StatusService {
	public getStatus = async (
		client: StockMongoClient,
		redisClient: RedisClientType,
	): Promise<StockApiStatus> => ({
		mongo: client.isConnected() ? "online" : "offline",
		redis:
			redisClient.isOpen && (await redisClient.ping()) === "PONG"
				? "online"
				: "offline",
	});

	public getOfflineStatus = (): StockApiStatus => ({
		mongo: "offline",
		redis: "offline",
	});
}
