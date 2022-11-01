import type { OwnedStock } from './OwnedStock';
import type { Trade } from './Trade';

export type Portfolio = {
  balance: number;
  trades: Trade[];
  stocks: OwnedStock[];
};
