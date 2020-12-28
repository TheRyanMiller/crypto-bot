import { CoinbaseProExchangeAPI } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProExchangeAPI';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import * as CBPTT from 'coinbase-pro-trading-toolkit';
import { LiveOrder } from 'coinbase-pro-trading-toolkit/build/src/lib/Orderbook';
import { FillFilter } from 'coinbase-pro';
import { AuthenticatedClient } from 'coinbase-pro';
import { Order } from '../../interfaces/order';
import { api } from '../../../common/services/apiAuth';

require('dotenv').config();

const logger = CBPTT.utils.ConsoleLoggerFactory();

console.log(process.env.COINBASE_PRO_API_URL)
console.log(process.env.COINBASE_PRO_KEY)
console.log(process.env.COINBASE_PRO_SECRET)
console.log(process.env.COINBASE_PRO_PASSPHRASE)

const coinbaseProConfig: CoinbaseProConfig = {
    logger: logger,
    apiUrl: process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,
    auth: {
        key: process.env.COINBASE_PRO_KEY,
        secret: process.env.COINBASE_PRO_SECRET,
        passphrase: process.env.COINBASE_PRO_PASSPHRASE
    }
};
const coinbasePro = new CoinbaseProExchangeAPI(coinbaseProConfig);
let authClient = new AuthenticatedClient(coinbaseProConfig.auth.key, coinbaseProConfig.auth.secret, coinbaseProConfig.auth.passphrase, coinbaseProConfig.apiUrl);

module.exports = (id: string, token: string, productId: string) => new Promise((resolve, reject)=>{
    coinbasePro.loadOrder(id).then((order: LiveOrder) => { // CALL!
        let o = convertOrderType(order);
        //Grab Fills for this order
        api(token).post("/order/update",{order: o}).then((resp) => { // CALL!
            console.log("Updated Order written to db.");
            resolve(resp);
        }).catch(err=>reject(err));
        let fillFilter: FillFilter = {
            product_id: productId,
            order_id: id
        }
        authClient.getFills(fillFilter).then( // CALL!
            (fills: any)=>{ 
            if(fills && fills.length>0){
                api(token).post(`/order/addFills/${id}`,{fills})
                .then((resp) => {
                    console.log("Added fill data to "+id);
                    resolve(resp);
                })
                .catch(err => {
                    console.log("updateDbOrder API CALL FAILED "+err);
                    reject(err);
                });
            }
        }).catch(err => {
            //Return error message
            try{
                let rateLimitError = false;
                let errorMessage = JSON.parse(err.response.body).message;
                if(errorMessage.includes("rate limit")) rateLimitError = true;
                let e = {rateLimitError, errorMessage}
                console.log(e);
                reject(e);
            }
            catch(e){
                reject(err);
            }
        })
        let typedOrder = {};
        typedOrder = {type: "order", order};
        resolve(typedOrder);
    }).catch(err => {
        //Return error message
        try{
            let rateLimitError = false;
            let errorMessage = JSON.parse(err.response.body).message;
            if(errorMessage.includes("rate limit")) rateLimitError = true;
            if(!rateLimitError && errorMessage==="NotFound" ){
                api(token).post(`/order/archive/${id}`).then((resp)=>{
                    console.log("Suspect this order didn't exist. Now it's archived: "+id);
                    resolve(resp);
                })
            }
            let e = {rateLimitError, errorMessage}
            console.log(e);
            reject(e);
        }
        catch(e){
            reject(err);
        }
    })
})


function convertOrderType(o: LiveOrder){
    console.log(o.extra)
    if(o.extra && o.extra.done_reason=="canceled"){
        o.status = "canceled";
    }
    let dbOrder: Order = {
        _id: o.id,
        id: o.id,
        price: Number(o.price),//.toFixed(8), //big number
        size: Number(o.size),//.toFixed(8), //big number
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
        exectued_value: o.extra.exectued_value,
        fills: null
    }
    return dbOrder;
}