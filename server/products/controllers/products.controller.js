const Product = require('../../profile/schemas/Product');
const Config = require('../../profile/schemas/Config');
require('dotenv').config();

exports.refreshAvailableProducts = (req, res) => {
    let configs;
    let config;
    Config.model.find({email: req.jwt.user.email}).then(results=>{
        configs = results;
    })
    require('../../coinbase/scripts/getProducts.ts')().then(products=>{
        let counter = 0;
        let configSavePromises = [];
        let mycount = 0;
        let currencyArray = process.env.BASE_CURRENCY.split(",");
        products.forEach(p=>{
            if(currencyArray.includes(p.quote_currency)){
                if(configs.length==0){
                    config = new Config.model({
                        id: p.id,
                        product: new Product.model(p),
                        email: req.jwt.user.email,
                        botEnabled: false,
                        buySize: 10, //big number
                        buyType: "limit",
                        limitOrderDiff: 1, //big number
                        cronValue: "0 0 1 1 *",
                        isActive: false, //User has set this active
                        isAvailable: true,
                        isDefault: counter==0
                    })
                    mycount++;
                    configSavePromises.push(config.save())
                    // config.save().then(res=>{
                    //     //
                    // }).catch(err => console.log(err))
                }
                for(let i=0;i<configs.length;i++){
                    //if there is a match already
                    if(configs[i].id==p.id){
                        return;
                    }
                    //No match, and on last item, so we can assume this is new and needs an insert
                    if(i==configs.length-1){
                        config = new Config.model({
                            id: p.id,
                            product: new Product.model(p),
                            email: req.jwt.user.email,
                            botEnabled: false,
                            buySize: 10, //big number
                            buyType: "limit",
                            limitOrderDiff: 1, //big number
                            cronValue: "0 0 1 1 *",
                            isActive: false, //User has set this active
                            isAvailable: true,
                            isDefault: false
                        })
                        mycount++;
                        configSavePromises.push(config.save())
                        // config.save().then(res=>{
                        //     //
                        // }).catch(err => console.log(err))
                    }
                }
                counter++;
            }
        })
        console.log(mycount)
        console.log("EXECUTING "+configSavePromises.length+" PROMISES")
        Promise.all(configSavePromises).then((resp)=>{
            if(configs.length===0){
                res.status(200).send({data: resp});
            }
            else{
                res.status(200).send({data: configs});
                console.log("SUCCESS!!!");
            }
            
        }).catch(function(err) {
            // log that I have an error, return the entire array;
            console.log("ERROR!!!",err)
            res.status(500).send({data: configs});  
        })
    })
};

exports.updateProductConfig = (req, res) => {
    req.body.params.forEach(p=>{
        let product = new Product.model(p);
        Product.model.findOneAndUpdate(
            { id: p.id, email: req.jwt.user.email },
            { $set: { cancel_only: p.cancel_only } },
            { upsert: true, new: true },
            (err,res)=>{
                if(err) console.log(err)
                console.log("Successfully wrote product!");
            }
        )
    })
    res.status(200).send({data: null});
};

exports.getSelectedProducts = (req, res) => {
    //
};