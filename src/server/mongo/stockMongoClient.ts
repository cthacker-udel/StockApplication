import { MongoClient } from "mongodb";
import { SECRETS } from "server/secrets";

export class StockMongoClient {
	private readonly client: MongoClient = new MongoClient(SECRETS.MONGO);
	private connected = false;

	/**
	 * Constructs a client instance, and then sets the corresponding connected status to whether or not the client is connected
	 */
	public constructor() {
		this.client
			.connect()
			.then((_result: MongoClient) => {
				console.log("Connected to database");
				this.connected = true;
			})
			.catch((error: unknown) => {
				console.log(
					`Failed to connect to database ${(error as Error).message}`,
				);
				this.connected = false;
			});
	}

	public getClient = (): MongoClient => this.client;

	public isConnected = (): boolean => this.connected;

	public close = async (): Promise<StockMongoClient> => {
		if (this.connected) {
			await this.client.close();
		}
		return this;
	};
}
