import { CoinbaseProExchangeAPI } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProExchangeAPI';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
const cbpConfig = require('../common/cbpConfig');
import { ApiKey } from '../interfaces/keys';
require('dotenv').config();

module.exports = (keys: ApiKey) => new Promise((resolve,reject)=>{
    const coinbaseProConfig: CoinbaseProConfig = cbpConfig(keys);
    const coinbasePro = new CoinbaseProExchangeAPI(coinbaseProConfig);
    coinbasePro.loadBalances().then( (resp) =>{
        resolve({
            data: resp[Object.keys(resp)[0]]
        }) 
    })
})