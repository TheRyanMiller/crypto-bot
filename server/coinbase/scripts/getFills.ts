import { AuthenticatedClient } from 'coinbase-pro';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import { FillFilter } from 'coinbase-pro';
const cbpConfig = require('../common/cbpConfig');
require('dotenv').config();

module.exports = (id: string, productId: string) => new Promise((resolve,reject)=>{
    const coinbaseProConfig: CoinbaseProConfig = cbpConfig();
    let authClient = new AuthenticatedClient(coinbaseProConfig.auth.key, coinbaseProConfig.auth.secret, coinbaseProConfig.auth.passphrase, coinbaseProConfig.apiUrl);
    let fillFilter: FillFilter = {
        order_id: id
    }
    authClient.getFills(fillFilter).then((fills: any)  => {
        resolve(fills);
    })
    .catch(err => {
        //Return error message 
        let rateLimitError = false;
        let errorMessage = JSON.parse(err.response.body).message;
        if(errorMessage.includes("rate limit")) rateLimitError = true;
        let e = {rateLimitError, errorMessage}
        console.log(e);
    })
})