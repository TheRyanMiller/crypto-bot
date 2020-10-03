import { PublicClient } from 'coinbase-pro';
require('dotenv').config();

module.exports = () => new Promise((resolve,reject)=>{
    const publicClient = new PublicClient(process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX);
    publicClient.getProducts().then((products)=>{
        resolve(products);
    }).catch(err => console.log(err));
})