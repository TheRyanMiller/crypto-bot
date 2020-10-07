const UserModel = require('../models/users.model');
const crypto = require('crypto');

exports.insert = (req, res, next) => {
    let salt = crypto.randomBytes(16).toString('base64');
    let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
    req.body.password = salt + "$" + hash;
    req.body.permissionLevel = 1;
    UserModel.createUser(req.body).then((result) => {
        //res.status(201).send({id: result._id});
        return next();
    }).catch(err=>{
        console.log(err)
        return res.status(400).send({errors: err});
    });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    UserModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.count = (req, res) => {
    UserModel.count()
        .then((result) => {
            res.json({ success: true, data: result })
        })
};

exports.getById = (req, res) => {
    UserModel.findById(req.params.userId)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getByEmail = (req, res) => {
    UserModel.findByEmail(req.params.email)
        .then((result) => {
            let user;
            if(result && result.length > 0) {
                user = result[0];
                delete user.password;
                delete user.id;
                delete user._id;
                delete user.cbpKey;
                delete user.cbpSecret;
                delete user.cbpPassphrase;
                res.status(200).send(user);
            }
            res.status(200).send("No results found.");
            
        });
};

exports.getCurrentUser = (req, res) => {
    UserModel.findByEmail(req.jwt.user.email)
        .then((result) => {
            let user;
            if(result && result.length > 0) {
                user = result[0];
                console.log(user)
                delete user.password;
                delete user.id;
                delete user._id;
                delete user.cbpKey;
                delete user.cbpSecret;
                delete user.cbpPassphrase;
                res.status(200).send(user);
            }
            else{
                res.status(200).send("No results found.")
            };
        });
};

exports.getUserByEmail = (email) => {
    UserModel.findByEmail(email)
        .then((result) => {
            let user;
            if(result && result.length > 0) {
                user = result[0];
                console.log(user)
            }
            else{
                
            };
        });
};

exports.getCbpKeys = (email) => new Promise(function(resolve, reject) {
    UserModel.findByEmail(email)
        .then((result) => {
            let user;
            if(result && result.length > 0) {
                user = result[0];
                let keys = {};
                keys.key = user.cbpKey;
                keys.secret = user.cbpSecret
                keys.passphrase = user.cbpPassphrase;
                user = null;
                result = null;
                resolve(keys);
            }            
        });
});

exports.patchById = (req, res) => {
    let email = req.jwt.user.email;
    let patchType = "cbpData";
    //patch types
    // 1. cbp data
    // 2. Email
    // 3. Password
    const algorithm = 'aes-256-cbc';
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    console.log("KEY",req.body.updateData.cbpKey)
    let encrypted = encrypt(req.body.updateData.cbpKey,key,iv)
    console.log("EKEY",encrypted);
    let decrypted = decrypt(encrypted,key,iv);
    console.log("DKEY",decrypted);
    if (req.body.password) {
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
        req.body.password = salt + "$" + hash;
    }

    if(patchType==="cbpData"){
    UserModel.patchCbpData(email, req.body.updateData)
        .then((result) => {
            console.log(result)
            res.status(204).send({});
        });
    }
};

exports.removeById = (req, res) => {
    UserModel.removeById(req.params.userId)
        .then((result)=>{
            res.status(204).send({});
        });
};