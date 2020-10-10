const Order = require('../schemas/Order');
const Fill = require('../schemas/Fill');
const FailedOrder = require('../schemas/FailedOrder');
const Log = require('../../common/schemas/Log');

exports.listOpenOrders = (req, res) => {
    let query = {};
    let sort = { createdAt : -1 };
    if(req.query.byLastSync==="true") sort = { lastSyncDate: 1 }
    query = {status: {$nin: ["done","canceled","archived"]}, isArchived: {$ne: true}};
    Order.find(query).sort(sort).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data })
    })
};

exports.listAllOrders = (req, res) => {
    let query = {email: req.jwt.user.email};
    let sort = { createdAt : -1 };
    Order.find(query).sort(sort).then((data,err) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data })
    })
    .catch(err=>console.log(err))
};

exports.getById = (req, res) => {
    let orderId = req.params.orderId;
    let query = {email: req.jwt.user.email, orderId};
    Order.find(query,(err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data })
    })
    .catch(err=>{
        console.log(err)
        return res.json({ success: false, error: err });
    });
};

exports.addOrder = (req, res) => {
    let o = req.body.order;
    console.log(o.extra)
    if(o.extra && o.extra.done_reason=="canceled"){
        o.status = "canceled";
    }
    let myOrder = new Order({
        _id: o.id,
        id: o.id,
        email: req.jwt.user.email,
        price: o.price,//.toFixed(8), //big number
        size: o.size,//.toFixed(8), //big number
        totalUsdSpent: req.body.dollarAmt,
        lastSyncDate: new Date(),
        time: o.time,
        productId: o.productId,
        status: o.status,
        profile_id: o.extra.profile_id,
        side: o.extra.side,
        type: o.extra.type,
        post_only: o.extra.post_only,
        created_at: o.extra.created_at,
        fill_fees: o.extra.fill_fees,
        filled_size: o.extra.filled_size,
        exectued_value: o.extra.exectued_value,
        fills: []
    })
    myOrder.save((err)=>{
        if(err) return res.json({ success: false, error: err });
        return res.json({ 
            success: true,
            message: "Written successfully." 
        });
    });
};

exports.updateById = (req, res) => {
    let o = req.body.order;
    let options = {new: true, upsert: true, useFindAndModify: false};
    let query = {email:req.jwt.user.email,id:o.id};
    console.log(o.extra)
    if(o.extra && o.extra.done_reason=="canceled"){
        o.status = "canceled";
    }
    Order.findOneAndUpdate(query,{
      //update
        _id: o.id,
        id: o.id,
        price: o.price,//.toFixed(8), //big number
        size: o.size,//.toFixed(8), //big number
        time: o.time,
        status: o.status,
        lastSyncDate: new Date(),
        profile_id: o.profile_id,
        side: o.side,
        type: o.type,
        post_only: o.post_only,
        created_at: o.created_at,
        fill_fees: o.fill_fees,
        filled_size: o.filled_size,
        exectued_value: o.exectued_value
    },options,(err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data })
    })
};


exports.logFailed = (req, res) => {
    let o = req.body.order;
    let failedMessage = req.body.failedMessage;
    let failedOrder = new FailedOrder(
        { 
            failedMessage,
            order: {
                price: Number(o.price),
                size: Number(o.size),
                totalUsdSpent: Number(req.body.dollarAmt),
                lastSyncDate: new Date(),
                time: o.time,
                productId: o.productId,
                email: req.jwt.user.email
            }
        })
    failedOrder.save((err)=>{
        if(err) return res.json({ success: false, error: err });
        let log = new Log.model({ type: "Failed Order", message: failedMessage,logLevel: "error", data: JSON.stringify })
        log.save((err)=>{
            if(err) return res.json({ success: false, error: err });
            return res.json({ success: true, message: "Written successfully." });
        }) 
    }).catch(err=>{
        console.log(err);
    });   
};

exports.archiveOrder = (req, res) => {
    let options = {useFindAndModify: false};
    Order.findOneAndUpdate(
        {id:req.params.orderId},
        {$set: {
            lastSyncDate: new Date(),
            isArchived: true,
            status: "archived"
            }
        }, 
        options,
        (err, data) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data })
    })
};

exports.addFills = (req, res) => {
    let fills = req.body.fills;
    let orderId = req.params.orderId;
    let myFill = new Fill.model({
        fills
    });
    Order.update(
        { _id: orderId },   
        { $set: { fills, lastSyncDate: new Date() } },
        (err)=>{
        if(err) return res.json({ success: false, error: err });
        return res.json({ 
            success: true,
            message: "Written successfully." 
        });
    });

}