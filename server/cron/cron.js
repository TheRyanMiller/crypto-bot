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

const kill = exports.kill = () => {
    if(cronTask) {
        cronTask.destroy();
        console.log("Cron destroyd!")
    }
}

const getAll = exports.getAll = () => {
    let tasklessCrons = [];
    let cronItem = {};
    cronArray.forEach(c=>{
        cronItem.id = c.id;
        cronItem.schedule = c.schedule;
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
            tasklessCrons.push(cronItem);
            cronItem = {};
        }
    })
    return tasklessCrons;
}

const set = exports.set = (config) => {
    if(config.botEnabled){
        if(cron.validate(config.cronValue)){
            //Kill existing cron if one exists
            for(let i = cronArray.length-1; i>=0; i--){
                if(cronArray[i].id == config.id) {
                    cronArray[i].task.destroy();
                    cronArray.splice(i,1);
                }
            }
            newTask = cron.schedule(config.cronValue, () =>  {
                UsersController.getCbpKeys(config.email).then(keys => {
                    placeOrder(config.id, config.limitOrderDiff, config.buySize, config.buyType, config.email, keys);
                })
            });
            cronArray.push({id: config.id, task: newTask, schedule: config.cronValue, email: config.email});
            Logger("Crypto-bot enabled", "Crypto-bot enabled with cron: "+config.cronValue,"info", config.cronValue, config.email);
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
        //Find cron task and kill it
        for(let i = cronArray.length-1; i>=0; i--){
            if(cronArray[i].id == config.id) {
                cronArray[i].task.destroy();
                cronArray.splice(i,1);
                //type, message, logLevel, data, email
                Logger("Disabled schedule","Disabled "+config.id,"info",config.cronValue);
            }
        }
        console.log("~~~CronArray has been Updated:")
            cronArray.forEach(c=>{
                console.log(c.id,c.schedule,c.task.getStatus())
            })
        console.log("~~~")
    }
}

