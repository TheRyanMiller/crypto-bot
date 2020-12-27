import { CoinbaseProExchangeAPI } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProExchangeAPI';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import { PlaceOrderMessage } from 'coinbase-pro-trading-toolkit/build/src/core/Messages';
import { OrderType } from 'coinbase-pro-trading-toolkit/build/src/core/Messages';
import { LiveOrder } from 'coinbase-pro-trading-toolkit/build/src/lib/Orderbook';
const cbpConfig = require('../common/cbpConfig');
const Order = require('../../orders/schemas/Order');
import { BigJS } from 'coinbase-pro-trading-toolkit/build/src/lib/types';
const Logger = require('../../../server/common/services/logger');
import { ApiKey } from '../interfaces/keys';
import { Product } from '../interfaces/product';

require('dotenv').config();

module.exports = (product: Product, differential: number, dollarAmt: number, orderTypeInput: string, email: string, keys: ApiKey) => {
    let marketPrice: number;
    let buyDifferential: number = Number(differential/100); //convert differential from % to decimal    
    const coinbaseProConfig: CoinbaseProConfig = cbpConfig(keys);
    const coinbasePro = new CoinbaseProExchangeAPI(coinbaseProConfig);

    const buildOrder = () => {
        let otype: OrderType;
        let orderPrice: number;
        if(orderTypeInput.toLowerCase()==='limit'){
            otype = 'limit';
            orderPrice = (marketPrice - (marketPrice * buyDifferential));
        }
        if(orderTypeInput.toLowerCase()==='market'){
            otype = 'market';
            orderPrice = marketPrice;
        }
        
        let sizeDecimalPrecision = countDecimals(product.base_increment.match(/^-?\d*\.?0*\d{0,1}/)[0]);
        let size = (dollarAmt/orderPrice).toFixed(sizeDecimalPrecision);

        console.log("=============")	
        console.log("COUNTING DECIAMLS:",product.base_increment)	
        console.log("PASSING IN NUMBER FORM:",(product.base_increment.match(/^-?\d*\.?0*\d{0,1}/)[0]))	
        console.log("Dollars:",dollarAmt);	
        console.log("Order Price:",orderPrice);	
        console.log("Size Before:",size);	
        console.log("Decimal Precision:",sizeDecimalPrecision);	
        console.log("FINALLY, HERE IS CALCULATED SIZE:",size);	
        console.log("=============")
        
        let order: PlaceOrderMessage = {
            time: new Date(),
            type: 'placeOrder',
            productId: product.id,
            clientId: null,
            price: orderPrice.toFixed(2),
            size: size,
            side: 'buy',
            orderType: otype,
            postOnly: true
        };
        return order;
    }

    // Allow some time between order placement and fetching of data.
    const delayOrderFetch = (orderId: string) => {
        return new Promise(function(resolve, reject) { 
            setTimeout( () => resolve(coinbasePro.loadOrder(orderId)), 15000); //Wait 15 seconds  
        });
    }

    coinbasePro.loadMidMarketPrice(product.id).then((price: BigJS) => {
        console.log("Current "+product.id+" price is: "+(Number(price) - (Number(price) * buyDifferential)).toFixed(2));
        marketPrice = Number(price.toFixed(8));
    })
    .then(()=>{
        coinbasePro.placeOrder(buildOrder()).then((o: LiveOrder) => {
            console.log("Order "+o.id+" placed successfully. Now fetching order data...");
            delayOrderFetch(o.id).then((o: any) => {
                if(o.extra && o.extra.done_reason=="canceled"){
                    o.status = "canceled";
                }
                let myOrder = new Order({
                    _id: o.id,
                    id: o.id,
                    email: email,
                    price: o.price,//.toFixed(8), //big number
                    size: o.size,//.toFixed(8), //big number
                    totalUsdSpent: dollarAmt,
                    marketPrice: marketPrice,
                    lastSyncDate: new Date(),
                    time: o.time,
                    productId: o.productId,
                    status: o.status,
                    profile_id: o.extra.profile_id,
                    side: o.extra.side,
                    type: o.extra.type,
                    post_only: o.extra.post_only,
                    created_at: o.extra.created_at,
                    fill_fees: o.extra.fill_fees,
                    filled_size: o.extra.filled_size,
                    executed_value: o.extra.executed_value,
                    fills: []
                })
                myOrder.save((err: any)=>{
                    if(err) return console.log("Error writing new order data to mongodb.");
                    console.log(o.extra.type+" order placed, and successful write to local db.");
                    Logger("New "+product.id+" order placed", "New  "+product.id+" order has been placed: "+myOrder.id, "info", JSON.stringify(myOrder), email);
                    return;
                });
                
            }).catch(err=>{
                let cbMessage = "Failed to fetch/write order data for successful "+product.id+" order to database. \nOrder ID: "+o.id+"\n"+err;
                console.log("Error writing order data to crypto-bot database after delay",err);
                Logger("Failed writing order to local database", cbMessage, "error", cbMessage, email, false);
            });
        }).catch(err=>{
            let failedMessage = JSON.parse(err.response.body).message;
            let cbMessage = "Failed "+product.id+" order. "+failedMessage+".";
            console.log("Error placing order on CB for "+email+" "+product.id);
            console.log(failedMessage)
            Logger("Failed Order", cbMessage, "error", cbMessage, email, false);
        })
    })
}

const countDecimals = function (value: string) {
    if(Math.floor(Number(value)) === Number(value)) return 0;
    if(value.split(".")[1]) return value.split(".")[1].length || 0; 
    return 0; 
}