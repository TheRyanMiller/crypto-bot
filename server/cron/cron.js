const cron = require('node-cron');  
const Log = require('../common/schemas/Log');
const Config = require('../profile/schemas/Config');
const placeOrder = require('../coinbase/scripts/orderPlacer.ts');
const UsersController = require('../users/controllers/users.controller');

const { noUsersExist } = require('../common/middlewares/auth.validation.middleware');
const Logger = require('../common/services/logger');


let cronTask;
let cronArray = [];
let newTask;


const initialize = exports.initialize = () =>{
    // Loop thru all configs for BOTENABLED
    // Schedule Each individual cron 
    Config.model.find({isActive:true}).then((data,err) => {
        if(data){
            data.forEach(c => {
                if(c.cronValue && c.botEnabled && c.email){
                    set(c);
                }
            })
        }
    })
}

const getAll = exports.getAll = () => {
    let tasklessCrons = [];
    let cronItem = {};
    cronArray.forEach(c=>{
        cronItem.id = c.id;
        cronItem.schedule = c.schedule;
        cronItem.email = c.email;
        cronItem.status = c.task.status;
        cronItem.product = c.product;
        tasklessCrons.push(cronItem);
        cronItem = {};
    })
    return tasklessCrons;
}

const getCronsByEmail = exports.getCronsByEmail = (email) => {
    let tasklessCrons = [];
    let cronItem = {};
    cronArray.forEach(c=>{
        if(email === c.email){
            cronItem.id = c.id;
            cronItem.schedule = c.schedule;
            cronItem.email = c.email;
            cronItem.product = c.product;
            tasklessCrons.push(cronItem);
            cronItem = {};
        }
    })
    return tasklessCrons;
}

/*
    SET method takes in a single config and compares it to all existing configs (cronArray)
    If config calls for ENABLED
        Check for match in array based on email/id combo
        IF found (already exists)
            kill cron
        Create cron
    
    If config calls for DISABLED
        Check array for match based on email/id combo
        If found (already exists)
            kill cron
*/

const set = exports.set = (config) => {
    if(config.botEnabled){
        if(cron.validate(config.cronValue)){
            //Kill existing cron if one exists
            for(let i = cronArray.length-1; i>=0; i--){
                if(cronArray[i].id == config.id && cronArray[i].email == config.email) {
                    cronArray[i].task.destroy();
                    cronArray.splice(i,1);
                }
            }
            // Recreate cron
            console.log("===== HERE IS THE PRODUCT VALUE ====")
            console.log(config.product)
            console.log("=====")
            newTask = cron.schedule(config.cronValue, () =>  {
                UsersController.getCbpKeys(config.email).then(keys => {
                    placeOrder(config.product, config.limitOrderDiff, config.buySize, config.buyType, config.email, keys);
                })
            });
            cronArray.push({id: config.id, task: newTask, schedule: config.cronValue, email: config.email, product: config.product});
            Logger("Crypto-bot enabled", "Crypto-bot enabled "+config.id+" with cron: "+config.cronValue,"info", config.cronValue, config.email, true);
            console.log("~~~CronArray has been Updated:")
            cronArray.forEach(c=>{
                console.log(c.id,c.schedule,c.task.getStatus());
            })
            console.log("~~~")
        }
        else{
            errorText = "Invalid cron entry."
            console.log(errorText);
            return res.json({ success: false, error: errorText});
        }
    }
    else{
        //Find cron task and kill it, do not reset
        for(let i = cronArray.length-1; i>=0; i--){
            if(cronArray[i].id == config.id && cronArray[i].email == config.email) {
                cronArray[i].task.destroy();
                cronArray.splice(i,1);
                //type, message, logLevel, data, email
                Logger("Disabled schedule","Disabled "+config.id,"info",config.cronValue,config.email,false);
            }
        }
        console.log("~~~CronArray has been Updated:")
        cronArray.forEach(c=>{
            console.log(c.id,c.schedule,c.task.getStatus())
        })
        console.log("~~~")
    }
}

