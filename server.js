const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const path = require("path");
const Log = require('./server/common/schemas/Log');
const cron = require('./server/cron/cron');
const OrderRouter = require('./server/orders/routes.orders');
const CoinbaseRouter = require('./server/coinbase/routes.coinbase');
const ProfileRouter = require('./server/profile/routes.profile');
const AuthRouter = require('./server/authorization/routes.authorization');
const UsersRouter = require('./server/users/routes.users');
const ProductsRouter = require('./server/products/routes.products');
const https = require('https');
const fs = require('fs');
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
ProductsRouter.routesConfig(router);

cron.initialize();

//Log Startup
let log = new Log.model({ type: "Startup", message: "Crypto bot server is launched.", logLevel: "info", data: "" })
log.save( err => { if(err) console.log(err)} )

// launch our backend into a port
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

//PROD
if(process.env.PROD==="false"){
  https.createServer({
    key: fs.readFileSync(process.env.CERT_KEY_PATH),
    cert: fs.readFileSync(process.env.CERT_PATH)
  }, app).listen(process.env.PORT || process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.PORT || process.env.API_PORT}`));
}

//NOT PROD
if(process.env.PROD==="false"){
  app.listen(process.env.PORT || process.env.API_PORT, () => console.log(`LISTENING ON PORT ${process.env.PORT || process.env.API_PORT}`));
}