import { BaseService } from "../../common";
import type { StockMongoClient } from "../../mongo";

export class TradingService extends BaseService {
	private readonly stockMongoClient: StockMongoClient;

	constructor(_stockMongoClient: StockMongoClient) {
		super("stock");
		this.stockMongoClient = _stockMongoClient;
	}

	/**
	 *
	 * @param username
	 * @param stockSymbol
	 * @param amount
	 * @returns whether or not the buy was successful
	 */
	public buyStock = async (
		username: string,
		stockSymbol: string,
		amount: number,
	): Promise<boolean> => {
		return false;
	};

	/**
	 *
	 * @param username
	 * @param stockSymbol
	 * @param amount
	 * @returns
	 */
	public sellStock = async (
		username: string,
		stockSymbol: string,
		amount: number,
	): Promise<boolean> => {
		// TODO: missing implementation
		return false;
	};

	/**
	 *
	 * @param username
	 * @param stockFromSymbol
	 * @param stockToSymbol
	 * @param stockFromAmount
	 * @param stockToAmount
	 * @returns
	 */
	public convertStock = async (
		username: string,
		stockFromSymbol: string,
		stockToSymbol: string,
		stockFromAmount: number,
		stockToAmount: number,
	): Promise<boolean> => {
		// TODO: Don't have to implement now, option isn't even in the front-end, can implement later on down the road
		return false;
	};
}
