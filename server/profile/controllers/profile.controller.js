const crypto = require('crypto');
const axios = require('axios').default;
const Config = require('../schemas/Config');
const Log = require('../../common/schemas/Log');
const Order = require('../../orders/schemas/Order');
const cron = require('../../cron/cron');
import tickers from '../common/coingeckomap.js';
const fs = require('fs');
const path = require('path');
const mongoose = require("../../common/services/mongoose.service").mongoose;
const Logger = require('../../common/services/logger');
const UsersController = require('../../users/models/users.model');
const moment = require('moment')

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
    let options = {new: true, upsert: false, useFindAndModify: false, returnNewDocument: true};
    Config.model.findOneAndUpdate({id:config.id, email:config.email}, set, options, (err, data) => {
        if (err) return res.json({ success: false, error: err });
        cron.set(data,null,req.jwt.user.email);
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

    Config.model.find({email: req.jwt.user.email}).then((data,err) => {
        // Script to add icons for each of a user's configs.
        if (err) return res.json({ success: false, error: err });
        numConfigs = data.length;
        data.forEach(c => {
            ticker = c.product.base_currency.toLowerCase();
            tickers.push(c.product.base_currency.toLowerCase());
                fs.readFile(fileStr+ticker+".png", (err, img)=>{
                    try{
                        if(err) throw "cannot find ticker"
                        query = {id: c.id, email: c.email};
                        set = {$set: { icon:  {data: img, contentType: "image/png"}}};
                        Config.model.findOneAndUpdate(query, set).then((data,err) => {
                            if (err) return res.json({ success: false, error: err });
                            if(count===numConfigs-1) return res.json({ success: true });
                        })
                    }
                    catch(err) {
                        console.log(err);
                        fs.readFile(fileStr+"yoyow.png", (err, img)=>{
                            if(err) return res.json({ success: false, error:err });
                            query = {id: c.id, email: c.email};
                            set = {$set: { icon:  {data: img, contentType: "image/png"}}};
                            Config.model.findOneAndUpdate(query, set).then((data,err) => {
                                if (err) return res.json({ success: false, error: err });
                                if(count===numConfigs-1) return res.json({ success: true });
                            })
                        });
                    }
                });            
        });
        
    })
};

exports.getAllCrons = (req, res) => {
    UsersController.findByEmail(req.jwt.user.email).then(users => {
        if(users && users[0] && users[0].isAdmin){
            let crons = cron.getAll();
            res.json({ success: true, data: crons })
        }
        else{
            return res.json({ success: false, data: "Insufficient Permissions" });
        }        
    }).catch(err=>{
        return res.json({ success: false, data: "Error" });
    })
    
};

exports.getCronsByEmail = (req, res) => {
    let crons = cron.getCronsByEmail(req.jwt.user.email);
    return res.json({ success: true, data: crons })
};

exports.getTimeSeriesBuys = (req, res) => {
    //let email = req.jwt.user.email;
    console.log(req.query.type)
    console.log("truthy",req.query.type === "adjustedUsd")
    let email = "rmiller07@gmail.com"
    let orderPerProduct = {};
    let baseUrl = "https://api.coingecko.com/api/v3/simple/price?ids="
    let quote_currency = "&vs_currencies=usd,eth";
    let tickerString = "";
    Object.keys(tickers).forEach(ticker=>{
        tickerString += tickers[ticker]+",";
    })
    tickerString = tickerString.substring(0,tickerString.length-1);
    let url = baseUrl + tickerString + quote_currency;
    axios.get(url).then(resp => {
        let geckoData = resp.data;
        Order.distinct("productId",{email}).then(distinctProducts => {
            let count = 1;
            let oData = [];
            let aggSize = 0;
            let aggUsd = 0;
            let aggActualUsd = 0;
            let spendingTotals = [];
            let idx = 0;
            let record = {};
            distinctProducts.forEach(pid =>{
                orderPerProduct[pid] = [];
                Order.find({productId: pid, email}).sort({createdAt:1}).then(pOrders => {
                    pOrders.forEach(o => {
                        aggSize += o.size;
                        aggActualUsd = 
                            o.executed_value ? 
                                aggActualUsd + Number(o.executed_value) : 
                                aggActualUsd + o.totalUsdSpent;
                        if(req.query.type === "adjustedUsd"){
                            aggUsd = geckoData[tickers[pid]] && geckoData[tickers[pid]].usd ? aggSize * geckoData[tickers[pid]].usd : 0;
                        }
                        else {
                            aggUsd = aggActualUsd;
                        }
                        oData.push({x: moment(o.createdAt).format("MM-DD-YY"), y: aggUsd.toFixed(2)})
                    })
                    orderPerProduct[pid] = oData;

                    record.productId = pid;
                    record.usdSpend = aggUsd;
                    record.size = aggSize;
                    record.queryType = req.query.type;
                    spendingTotals[idx++] = record;
                    
                    record = {};
                    oData = [];
                    aggSize = 0;
                    aggUsd = 0;
                    aggActualUsd = 0;
                    pOrders = null;
                    if(distinctProducts.length <= count++){
                        return res.json({ success: true, data: {
                            orderPerProduct,
                            spendingTotals
                        }});
                    }
                });
            })
        })
    })
    
    
    
};