
import { AuthenticatedClient } from 'coinbase-pro';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import { FillFilter } from 'coinbase-pro';
import { Order } from '../../interfaces/order';
import * as CBPTT from 'coinbase-pro-trading-toolkit';
import { api } from '../../../common/services/apiAuth';
import { ApiKey } from '../../interfaces/keys';
require('dotenv').config();


module.exports = (dbOrder: Order, token: string, productId: string, keys: ApiKey) => new Promise((resolve, reject)=>{
    const logger = CBPTT.utils.ConsoleLoggerFactory();
    const coinbaseProConfig: CoinbaseProConfig = {
        logger: logger,
        apiUrl: process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,
        auth: {
            key: keys.key,
            secret: keys.secret,
            passphrase: keys.passphrase
        }
    };
    let authClient = new AuthenticatedClient(coinbaseProConfig.auth.key, coinbaseProConfig.auth.secret, coinbaseProConfig.auth.passphrase, coinbaseProConfig.apiUrl);

    let fillFilter: FillFilter = {
        product_id: productId,
        order_id: dbOrder.id
    }
    let typedFill = {type: "fill", fills: {}};
    authClient.getFills(fillFilter).then((fills: any)  => {
        typedFill.fills = fills;
        if(fills.length>0){
            //add All fills
            api(token).post(`/addFills/${dbOrder.id}`,{fills})
            .then((resp) => {
                console.log("Found new fills. /addFills db write failed. "+dbOrder.id);
                resolve(resp);
            })
            .catch(err => {
                console.log("Found new fills. /addFills db write failed. "+dbOrder.id)
                reject(err);
            });
        }
        else{
            console.log("No fill data found for order "+dbOrder.id);
        }
        resolve(typedFill);
    }).catch(err=>{
        reject(err);
    });
})