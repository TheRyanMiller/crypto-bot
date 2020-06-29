import { PublicClient } from 'coinbase-pro';
require('dotenv').config();

const product = "BTC-USD";

module.exports = () => new Promise((resolve,reject)=>{
    const publicClient = new PublicClient(process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,);

    publicClient.getProductTicker(product).then((resp)=>{
        console.log("GET PRODUCT TCKER ---> ", resp.price);
        resolve(resp.price);
    }).catch(err => console.log(err));
})