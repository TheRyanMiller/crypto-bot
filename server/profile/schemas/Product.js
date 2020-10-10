const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    id: String,
    base_currency: String,
    quote_currency: String,
    email: String,
    base_min_size: String,
    base_max_size: String,
    quote_increment: String,
    base_increment: String,
    display_name: String,
    min_market_funds: String,
    max_market_funds: String,
    margin_enabled: Boolean,
    post_only: Boolean,
    limit_only: Boolean,
    cancel_only: Boolean,
    trading_disabled: Boolean,
    status: String,
    status_message: String
  }
);

// export the new Schema so we could modify it using Node.js
module.exports.model = mongoose.model("product", ProductSchema);
module.exports.schema = ProductSchema;