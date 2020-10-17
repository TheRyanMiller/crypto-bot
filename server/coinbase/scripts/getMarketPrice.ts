import { PublicClient } from 'coinbase-pro';
require('dotenv').config();

module.exports = (productId: string) => new Promise((resolve,reject)=>{
    const publicClient = new PublicClient(process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,);
    publicClient.getProductTicker(productId).then((resp)=>{
        resolve(resp.price);
    }).catch(err => console.log(err));
})