const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require("path");
const Order = require('./server/orders/schemas/Order');
const Fill = require('./server/orders/schemas/Fill');
const FailedOrder = require('./server/orders/schemas/FailedOrder');
const Log = require('./server/common/schemas/Log');
const Config = require('./server/profile/schemas/Config');
let placeOrder = require('./server/coinbase/scripts/orderPlacer.ts');
const cron = require('./server/cron/cron');
const OrderRouter = require('./server/orders/routes.orders');
const CoinbaseRouter = require('./server/coinbase/routes.coinbase');
const ProfileRouter = require('./server/profile/routes.profile');
const AuthRouter = require('./server/authorization/routes.authorization');
const UsersRouter = require('./server/users/routes.users');
require('dotenv').config();

const API_PORT = 3001;
const app = express();
const router = express.Router();

// USE middleware are executed every time a request is receieved
// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, "client", "build")));
app.use(cors());
app.use('/api', router);
OrderRouter.routesConfig(router); //ATTACH ROUTERS
CoinbaseRouter.routesConfig(router);
ProfileRouter.routesConfig(router);
AuthRouter.routesConfig(router);
UsersRouter.routesConfig(router);

cron.initialize();

//Log Startup
let log = new Log.model({ type: "Startup", message: "Crypto bot server is launched.", logLevel: "info", data: "" })
log.save( err => { if(err) console.log(err)} )




// launch our backend into a port
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});
app.listen(process.env.PORT || process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.PORT || process.env.API_PORT}`));