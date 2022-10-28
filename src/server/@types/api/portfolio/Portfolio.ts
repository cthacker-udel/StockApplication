import type { OwnedStock } from "../stock/OwnedStock";
import type { Trade } from "../trade/Trade";

export type Portfolio = {
	balance: number;
	trades: Trade[];
	stocks: OwnedStock[];
};
