import { Order } from '../interfaces/order';
import { api } from '../../common/services/apiAuth';
import { ApiKey } from '../interfaces/keys';

require('dotenv').config();

module.exports = (token: string, keys: ApiKey) => {
    return new Promise((resolve,reject)=>{
        let allCBPromises: any[] = [];
        let openDbOrders: Order[];
        //Prepare API config
        api(token).get('/order/getOpen?byLastSync=true')
        .then((resp: any) => {
            console.log("Successful DB CALL (sync3) "+resp.data.data);
            openDbOrders=resp.data.data;
            console.log(openDbOrders.length+" open orders found in database.");
            console.log()
            if(openDbOrders.length>0){
                openDbOrders.forEach(dbOrder => {
                    allCBPromises.push(require('./promiseTypes/fillsPromise.ts')(dbOrder, token, dbOrder.productId, keys));
                    allCBPromises.push(require('./promiseTypes/orderPromise.ts')(dbOrder.id, token, dbOrder.productId, keys));
                })
            }
            else{
                console.log("No open DB orders found.");
                resolve("No open db orders found.");
            }
            if(allCBPromises.length>0){
                Promise.all(allCBPromises).then((resp)=>{
                    resolve(resp);
                }).catch(function(err) {
                    // log that I have an error, return the entire array;
                    reject(err);
                })
            }
        })
        .catch(err => {
            console.log("DB CALL FAILED");
            reject(err);
        });
    })
}