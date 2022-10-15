import { application } from "express";
import { Stock, User } from "server/@types";
export { StockController } from "./stock.controller";
export { StockService } from "./stock.service";

function buyStock(stock: Stock, user: User, buyAmount: number) {
    let buyPrice = stock.price;
    // let currentAmount = user.portfolio.get(stock)
    // if (currentAmount+buyAmount) > totalShares:
    //      return ("Can only buy ", totalShares)
    // cashLost = buyPrice*buyAmount
    // if (currentAmount - cashLost) < 0:
    //       return ("cannot afford")
    application.post('/buy', (req, res) => {
        stock.totalShares -= buyAmount
        //user.portfolio.set(stock, currentAmount+buyAmount)
        //user.portfolio.set(cash, currentAmount-cashLost)
    });
}

function sellStock(stock: Stock, user: User, sellAmount: number) {
    let sellPrice = stock.price
    // let currentAmount = user.portfolio.get(stock)
    // if currentAmount < sellAmount:
    //      return ("Cannot Sell")
    application.post('/sell', (req, res) => {
        stock.totalShares += sellAmount
        // cashGained = sellPrice*sellAmount
        // user.portfolio.set(stock, currentAmount-sellAmount)
        // user.portfolio.set(cash, currentAmount+cashGained)
    });
}

//Probably gonna change this
function calculateStockPrice(stock: Stock) {
    let volume = stock.volume;
    let totalShares = stock.totalShares;
    let risk = stock.risk;
    let percentTraded = volume/totalShares;
    let change = percentTraded*risk;
    return change;
}