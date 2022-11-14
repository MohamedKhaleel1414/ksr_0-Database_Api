const mongoose = require("mongoose");

const exchangeOrderSchema = new mongoose.Schema({
    firstUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    secondUserId: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
        required: true
    },
    firstProductId: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    secondProductId: {
        type: mongoose.Types.ObjectId,
        ref: 'product',
        required: true
    },
    firstProductPrice: {
        type: Number,
        required: true,
    },
    secondProductPrice: {
        type: Number,
        required: true,
    },
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
    addressfrom: {
        type: String,
        required: true,
    },
    addressto: {
        type: String,
        required: true,
    },
    paymentmethod: {
        type: String,
        required: true,
    }, 
})
module.exports = mongoose.model("exchangeOrderCollection", exchangeOrderSchema)