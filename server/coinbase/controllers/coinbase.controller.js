const crypto = require('crypto');
let placeOrder = require('../scripts/orderPlacer.ts');
const UserModel = require('../../users/models/users.model');

exports.placeOrder = (req, res) => {
    let differential;
    if(!req.body.params || !req.body.params.differential){
        differential = process.env.BUY_DIFFERENTIAL;
    }
    else{
        let product = req.body.params.product;
        let differential = req.body.params.differential;
        let dollarAmt = req.body.params.buySize;
        let orderType = req.body.params.orderType;
    }
    placeOrder(product, differential, dollarAmt, orderType, req.jwt.user.email, req.keys);
    return res.json({ success: true, data: null });
};

exports.syncOrders = (req, res) => {
    let token = "";
    if (req.headers['authorization']) {
        let authorization = req.headers['authorization'].split(' ');
        token = authorization[1];
    }
    require('../scripts/sync.ts')(token).then(()=>{
        return res.json({ success: true, data: null });
    }).catch(err=>{
        console.log("Failed sync.")
        return res.json({ success: false, error: err });
    });
};

exports.getFills = (req, res) => {
    require('../scripts/getFills.ts')(req.params.orderId, req.keys).then(data=>{
        return res.json({ success: true, data: data });
    })
    .catch(err=>{
        console.log(err)
        return res.json({ success: false, error: err });
    });
};

exports.getKeys = (req, res, next) => {
    UserModel.findByEmail(req.jwt.user.email).then(result => {
        let user;
        if(result && result.length > 0) {
            user = result[0];
            let keys = {};
            keys.key = user.cbpKey;
            keys.secret = user.cbpSecret
            keys.passphrase = user.cbpPassphrase;
            req.keys = keys;
            next();
        }
        return new Error();
    });    
};

exports.getMarketPrice = (req, res) => {
    require('../scripts/getMarketPrice.ts')(req.query.productId).then(data=>{
        console.log("PRICE: ",data)
        return res.json({ success: true, data: data })
    })
    .catch(err=>{
        console.log(err)
        return res.json({ success: false, error: err });
    });
}

exports.getAccountBalances = (req, res) => {
    require('../scripts/getAccountInfo.ts')(req.keys).then(response=>{
        let balances = [];
        let item = {};
        Object.entries(response.data).forEach(v=>{
            item.id = v[0]
            //console.log(v)
            try{
                item.balance = v[1].balance.toString();
                item.available = v[1].available.toString();
                balances.push(item);
                item = {};
            }
            catch(err){
                console.log(err)
            }
        })
        return res.json({ success: true, data: balances })
    })
    .catch(err=>{
        console.log(err)
        return res.json({ success: false, error: err });
    });
}

exports.getOrder = (req, res) => {
    require('../scripts/getOrder.ts')(req.params.orderId, req.keys).then(data=>{
        return res.json({ success: true, data: data });
    })
    .catch(err=>{
        console.log(err)
        return res.json({ success: false, error: err });
    });
}