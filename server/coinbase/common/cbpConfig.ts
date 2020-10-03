
import { CoinbaseProConfig } from 'coinbase-pro-trading-toolkit/build/src/exchanges/coinbasePro/CoinbaseProInterfaces';
import * as CBPTT from 'coinbase-pro-trading-toolkit';
import { ApiKey } from '../interfaces/keys';
require('dotenv').config();
const logger = CBPTT.utils.ConsoleLoggerFactory();

module.exports = (keys: ApiKey) => {
    const coinbaseProConfig: CoinbaseProConfig = {
        logger: logger,
        apiUrl: process.env.COINBASE_PRO_API_URL || process.env.COINBASE_PRO_API_URL_SANDBOX,
        auth: {
            key: keys.key,
            secret: keys.secret,
            passphrase: keys.passphrase
        }
    };
    return coinbaseProConfig;
}