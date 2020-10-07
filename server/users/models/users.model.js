const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;
var encrypt = require('mongoose-encryption');

const userSchema = new Schema({
    name: String,
    email: String,
    password: String,
    permissionLevel: Number,
    depositsEnabled: Boolean,
    usdcDepositAmount: Number,
    usdcToUsdConversionAmount: Number,
    enableEmailAlerts: Boolean,
    cbpKey: String,
    cbpSecret: String,
    cbpPassphrase: String
});

let encKey = process.env.MONGO_32BYTE_ENC_KEY;
let sigKey = process.env.MONGO_64BYTE_SIG_KEY;

userSchema.plugin(encrypt, { 
    encryptionKey: encKey, signingKey: sigKey, encryptedFields: [
        'cbpKey',
        'cbpSecret',
        'cbpPassphrase'
    ] 
})

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);

exports.findByEmail = (email) => {
    return User.find({email: email})
    .then(result => {
        let obj = {};
        let users = [];
        for (var i = 0 ; i < result.length; i++) {
            obj = result[i].toJSON();
            delete obj.__id;
            delete result.__v;
            users.push(obj);
            obj = {};
        }
        return users;
    });
};

exports.findById = (id) => {
    return User.findById(id)
        .then(result => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.count = () => {
    return new Promise((resolve, reject) => {
        let query = {};
        User.countDocuments(query,(err, count)=>{
            if(err) reject(err);
            resolve(count);
        })
    });
};

exports.patchCbpData = (email, userData) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate(
            { email },
            { $set: {
                cbpKey: userData.cbpKey,
                cbpPassphrase: userData.cbpPassphrase,
                cbpSecret: userData.cbpSecret
            }},
            (err,res)=>{
                if(err) console.log(err)
                console.log("Successfully updated user!");
            }
        )
    })

};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.remove({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

