import { AuthenticatedClient } from 'coinbase-pro';
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import * as CBPTT from 'coinbase-pro-trading-toolkit';
const logger = CBPTT.utils.ConsoleLoggerFactory();
require('dotenv').config();

module.exports = (cbpKey: string, cbpSecret: string, cbpPassphrase: string) => new Promise((resolve,reject)=>{
    const coinbaseProConfig: CoinbaseProConfig = {
        logger: logger,
        apiUrl: process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,
        auth: {
            key: cbpKey,
            secret: cbpSecret,
            passphrase: cbpPassphrase
        }
    };
    let authClient = new AuthenticatedClient(coinbaseProConfig.auth.key, coinbaseProConfig.auth.secret, coinbaseProConfig.auth.passphrase, coinbaseProConfig.apiUrl);

    authClient.convert({"from": "USD","to": "USDC","amount": "0.00"}).then((res:any)=>{
        console.log(res);
    }).catch(err=>{
        try{
            let code: Number;
            if(err.response.toJSON().statusCode===400){
                code=400;
            }
            else if(err.response.toJSON().statusCode===401){
                code=401;
            }
            else if(err.response.toJSON().statusCode===403){
                code=403;
            }
            else{
                reject("Status code not recognized");
            }
            resolve(code)
        }
        catch(err){
            console.log("Cannot determne issue");
            reject(err);
        }
    })
})




