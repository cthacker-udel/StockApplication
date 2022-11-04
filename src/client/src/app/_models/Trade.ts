/* eslint-disable no-unused-vars -- not needed */

export enum TRADE_TYPE {
	BUY = 0,
	SELL = 1,
}

export type Trade = {
	type: TRADE_TYPE;
	profit?: number;
	loss?: number;
	stockAmount: number;
	stockSymbol: string;
	time: Date;
};
