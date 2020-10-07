const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const UserModel = require('../../users/models/users.model');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET

exports.verifyRefreshBodyField = (req, res, next) => {
    if (req.body && req.body.refresh_token) {
        return next();
    } else {
        return res.status(400).send({error: 'need to pass refresh_token field'});
    }
};

exports.validRefreshNeeded = (req, res, next) => {
    let b = new Buffer(req.body.refresh_token, 'base64');
    let refresh_token = b.toString();
    let hash = crypto.createHmac('sha512', req.jwt.refreshKey).update(req.jwt.userId + secret).digest("base64");
    if (hash === refresh_token) {
        req.body = req.jwt;
        return next();
    } else {
        return res.status(400).send({error: 'Invalid refresh token'});
    }
};


exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send();
            } else {
                req.jwt = jwt.verify(authorization[1], jwtSecret);
                return next();
            }

        } catch (err) {
            console.log("INVALID JWT!!!",err)
            return res.status(403).send();
        }
    } else {
        return res.status(401).send();
    }
};

exports.noUsersExist = (req, res, next) => {
    UserModel.count().then(resp=>{
        if(resp>0) return res.status(403).send();
        if(resp===0) return next();
    }).catch(err=>{
        console.log(err);
        res.status(403).send();
    })
};