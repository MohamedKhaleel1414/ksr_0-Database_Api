const express = require('express');
const multer = require("multer");
const router = express.Router();
const exchangeOrders = require('../model/exchangeOrder');
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { json } = require('express');
const dotenv = require("dotenv").config();
const users = require('../model/users');

//create exchange order
// router.post("/exchangeOrder/:id/:ideo", (req, res) => {
//     exchangeOrders.create(req.body, (err, data) => {
//         if (err)
//             res.send("ERRRRR!!!!!")
//         else {
//             users.findOne({ '_id': req.params.id }).then((fail, success) => {
//                 if (fail)
//                     res.send("failed update!!!!")
//                 else {
//                     success.cart.push(req.params.ideo)
//                     success.save()
//                     res.send("order added!!!")
//                 }
//             })
//         }
//     })
// })

// router.post("/exchangecreateorder/:fid/:sid",async(req,res)=>{
//     await orders.create(req.body,(data,error)=>{
//         console.log(req.body)
//     })   
// })
