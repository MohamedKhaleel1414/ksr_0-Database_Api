const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  buyerId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: true,
  },
  sellerId: [
    {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: true,
    },
  ],
  cart: [
    {
      type: mongoose.Types.ObjectId,
      ref: "product",
      required: true,
    },
  ],
  orderPrice: {
    type: Number,
    required: true,
  },
  profit: {
    type: Number,
    required: true,
  },
  shipping: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "On Way",
  },
  address: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now,
  },
  paymentmethod: {
    type: String,
    required: true,
  },
},
{
  versionKey: false,
  strict: true,
});
module.exports = mongoose.model("orderCollection", orderSchema);