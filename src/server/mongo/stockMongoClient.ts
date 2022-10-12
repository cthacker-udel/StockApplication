import { MongoClient } from "mongodb";
import { SECRETS } from "server/secrets";

/**
 * MongoClient wrapper, used to provide an hopeful easier interface into using the client, only has to be instantiated once (in app.ts) then is passed down into all requirements
 */
export class StockMongoClient {
	/**
	 * The MongoClient from the mongodb library
	 */
	private readonly client: MongoClient = new MongoClient(SECRETS.MONGO);
	/**
	 * Whether or not the client is connected to the mongo server
	 */
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
