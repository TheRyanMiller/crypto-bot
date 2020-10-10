const mongoose = require("../../common/services/mongoose.service").mongoose;
const Schema = mongoose.Schema;

const LogSchema = new Schema(
  {
    type: String, //FailedOrder
    logLevel: String, //insufficientfunds
    message: String, //insufficientfunds
    data: String,
    email: String,
    isAdmin: Boolean
  },{ timestamps: true }
);

// export the new Schema so we could modify it using Node.js
const Log = exports.model = mongoose.model("Log", LogSchema);