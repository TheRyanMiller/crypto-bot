const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FillSchema = new Schema(
  {
    created_at: String,
    email: String,
    trade_id: Number, //big number
    product_id: String, //big number
    order_id: String,
    user_id: String,
    profile_id: String,
    liquidity: String,
    price: String,
    size: String,
    fee: String,
    side: String,
    settled: Boolean,
    used_volume: String
  }
);

// export the new Schema so we could modify it using Node.js
module.exports.model = mongoose.model("Fill", FillSchema);
module.exports.schema = FillSchema;
