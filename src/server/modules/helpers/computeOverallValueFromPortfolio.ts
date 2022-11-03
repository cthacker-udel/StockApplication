import { type Portfolio, type Trade, TRADE_TYPE } from "../../@types";

export const computeOverallValueFromPortfolio = (
	portfolio: Portfolio,
): number => {
	const { balance, trades } = portfolio;
	return (
		balance +
		trades
			.map((eachTrade: Trade) => {
				if (eachTrade.type === TRADE_TYPE.SELL) {
					return eachTrade.profit ?? 0;
				}
				return 0;
			})
			.reduce((value1: number, value2: number) => value1 + value2, 0)
	);
};
