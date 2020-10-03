import { CoinbaseProExchangeAPI } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProExchangeAPI';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
const cbpConfig = require('../common/cbpConfig');
import { ApiKey } from '../interfaces/keys';
require('dotenv').config();


module.exports = (id: string, keys: ApiKey) => new Promise((resolve,reject)=>{
    const coinbaseProConfig: CoinbaseProConfig = cbpConfig(keys);
    const coinbasePro = new CoinbaseProExchangeAPI(coinbaseProConfig);
    console.log("HERES THE ID: ",id)
    coinbasePro.loadOrder(id).then((order) => {
        //console.log(order.id+": "+order.status+" "+order.extra.status);
        resolve(order);
    })
    .catch(err => {
        try{
            let rateLimitError = false;
            let errorMessage = JSON.parse(err.response.body);
            if(errorMessage.includes("rate limit")) rateLimitError = true;
            let e = {rateLimitError, errorMessage}
            reject(e);
        }
        catch(e){
            console.log(err.response.body);
            reject(err.response.body)
        }
        
    })
})