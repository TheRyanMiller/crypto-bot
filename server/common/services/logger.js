const Log = require('../schemas/Log');
const nodemailer = require('nodemailer');
const User = require('../../users/models/users.model');
require('dotenv').config();

// API = type, message, logLevel, data, email

/*
    Error
    Warn
    Info
    Debug
*/

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'cryptobot.notifications@gmail.com',
      pass: process.env.EMAIL_PASSWORD
    }
});

let mailOptions = {
    from: 'cryptobot.notifications@gmail.com'
};

module.exports = (type, message, logLevel, data, email, isAdmin) => {

    // Write log to Database
    let log = new Log.model({type, message, logLevel, data, email, isAdmin})
    log.save( err => {
        if(err) console.log(err)
    })

    // Email log only when level is ERROR
    User.findByEmail(email).then(res=>{
        if(logLevel==="error" && res && res[0] && res[0].enableEmailAlerts){
            mailOptions.to = email;
            mailOptions.cc = process.env.ADMIN_EMAIL;
            mailOptions.subject = "["+process.env.SERVERNAME+"] "+message;
            mailOptions.text = message;
            mailOptions.text += "\n\nServer Name: "+process.env.SERVERNAME;
            transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Alert email sent: ' + info.response);
            }
            });
        }
    })
}


