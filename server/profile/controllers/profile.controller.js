const crypto = require('crypto');
const Config = require('../schemas/Config');
const Log = require('../../common/schemas/Log');
const cron = require('../../cron/cron');
const fs = require('fs');
const path = require('path');
const mongoose = require("../../common/services/mongoose.service").mongoose;
const Logger = require('../../common/services/logger');

exports.listLogs = (req, res) => {
    let query = { email: req.jwt.user.email };
    let sort = { createdAt : -1 };
    Log.model.find(query).sort(sort).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data })
    })
    .catch(err=>console.log(err))
};

exports.getConfig = (req, res) => {
    let query = {id: req.query.product, email: req.jwt.user.email };
    let sort = { createdAt : -1 };
    Config.model.findOne(query).sort(sort).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data })
    })
};

exports.getAllActiveConfigs = (req, res) => {
    let query = { isActive:true, email: req.jwt.user.email };
    let sort = { id : -1 };
    Config.model.find(query).sort(sort).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data })
    })
};

exports.saveConfig = (req, res) => {
    let config = req.body.params;
    config.email = req.jwt.user.email;
    let err = null;
    let set = {
        $set: { 
            botEnabled: config.botEnabled,
            buySize: config.buySize,
            limitOrderDiff: config.limitOrderDiff,
            cronValue: config.cronValue,
            buyType: config.buyType,
            email: req.jwt.user.email
        }
    }
    let options = {new: true, upsert: false, useFindAndModify: false};
    Config.model.findOneAndUpdate({id:config.id, email:config.email}, set, options, (err, data) => {
        if (err) return res.json({ success: false, error: err });
        cron.kill();
        cron.set(config,null,req.jwt.user.email);
        let log = new Log.model({
            type: "Config change",
            message: "New config saved",
            logLevel: "low",
            data: JSON.stringify(config)
        })
        log.save((err)=>{
            if(err) {
                console.log(err);
            }
        })
        return res.json({ success: true, data: data });
    })
};

exports.setActive = (req, res) => {
    let query = {id: req.body.params.id, email: req.jwt.user.email};
    console.log(req.jwt.user.email)
    console.log(req.body.params.id+" IS ACTIVE: ",req.body.params.isActive)
    let set = {$set: { isActive: req.body.params.isActive }}
    Config.model.findOneAndUpdate(query, set).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data })
    })
};

exports.addIcon = (req, res) => {
    let btc;
    let eth;
    let tickers = [];
    let ticker = "";
    let query = "";
    let set = "";
    let count = 0;
    let numConfigs = 0;
    let fileStr = path.dirname(require.main.filename)+"/node_modules/cryptocurrency-icons/32/color/";

    Config.model.find({}).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        numConfigs = data.length;
        data.forEach(c => {
            ticker = c.product.base_currency.toLowerCase();
            tickers.push(c.product.base_currency.toLowerCase());
            
                fs.readFile(fileStr+ticker+".png", (err, img)=>{
                    try{
                        if(err) throw "cannot find ticker"
                        query = {id: c.id};
                        set = {$set: { icon:  {data: img, contentType: "image/png"}}};
                        Config.model.findOneAndUpdate(query, set).then((data,err) => {
                            console.log(count++, numConfigs-1);
                            if (err) return res.json({ success: false, error: err });
                            if(count===numConfigs-1) return res.json({ success: true });
                        })
                    }
                    catch(err) {
                        console.log(err);
                        fs.readFile(fileStr+"yoyow.png", (err, img)=>{
                            if(err) return res.json({ success: false, error:err });
                            query = {id: c.id};
                            set = {$set: { icon:  {data: img, contentType: "image/png"}}};
                            Config.model.findOneAndUpdate(query, set).then((data,err) => {
                                console.log(count++, numConfigs-1);
                                if (err) return res.json({ success: false, error: err });
                                if(count===numConfigs-1) return res.json({ success: true });
                            })
                        });
                    }
                });            
        });
        
    })
};

exports.getCrons = (req, res) => {
    let crons = cron.getAll();
    return res.json({ success: true, data: crons })
};

exports.getCronsByEmail = (req, res) => {
    let crons = cron.getCronsByEmail(req.jwt.user.email);
    return res.json({ success: true, data: crons })
};