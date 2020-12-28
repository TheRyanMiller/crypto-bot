
import { AuthenticatedClient } from 'coinbase-pro';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import { FillFilter } from 'coinbase-pro';
import { Order } from '../../interfaces/order';
import { api } from '../../../common/services/apiAuth';
import { ApiKey } from '../../interfaces/keys';
const cbpConfig = require('../../common/cbpConfig');
require('dotenv').config();


module.exports = (dbOrder: Order, token: string, productId: string, keys: ApiKey) => new Promise((resolve, reject)=>{
    const coinbaseProConfig: CoinbaseProConfig = cbpConfig(keys);
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
                console.log("Found new fills. /addFills db write success. "+dbOrder.id);
                resolve(resp);
            })
            .catch(err => {
                console.log("Found new fills. /addFills db write failed. "+dbOrder.id,err)
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