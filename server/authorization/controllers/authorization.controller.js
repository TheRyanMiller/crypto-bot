jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuid = require('uuid');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET
const jwt_life_in_seconds = Number(process.env.JWT_EXPIRATION_IN_SECONDS);

exports.login = (req, res) => {
    try {
        let refreshId = req.body.userId + jwtSecret;
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(refreshId).digest("base64");
        delete req.body.exp;
        delete req.body.user.cbpKey;
        delete req.body.user.cbpSecret;
        delete req.body.user.cbpPassphrase;
        delete req.body.user._id;
        let token = jwt.sign(req.body, jwtSecret, { expiresIn: jwt_life_in_seconds });
        req.body.refreshKey = salt;
        let b = new Buffer(hash);
        let refresh_token = b.toString('base64');
        res.status(201).send({accessToken: token, refreshToken: refresh_token});
    } catch (err) {
        console.log(err);
        res.status(500).send({errors: err});
    }
};

exports.refresh_token = (req, res) => {
    try {
        req.body = req.jwt;
        let token = jwt.sign(req.body, jwtSecret);
        res.status(201).send({id: token});
    } catch (err) {
        res.status(500).send({errors: err});
    }
};
