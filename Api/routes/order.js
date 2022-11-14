const express = require('express');
const multer =require("multer");
const router = express.Router();
const orders = require('../model/order');
const exchangeorders = require('../model/exchangeOrder')
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { json } = require('express');
const dotenv = require("dotenv").config();
const users = require('../model/users');
const product = require('../model/product');

//Get sellers from buyer cart
router.get("/sellersfromcart/:id",async function(req,res){
    let prods=[]
    let sellrs=[]
    await users.findOne({"_id":req.params.id},{}).then((data,err)=>{
        prods=[...data.cart]
    })
    await Promise.all(
        prods.map(async function(item,index){
            await product.find({"_id":item},{}).then((dta,err)=>{
                sellrs.push(dta[0].userId)
            })
        })
    )
    res.send(sellrs)
})


// create selling order and update orders in user collection
// router.post("/order/:id/:ido",(req,res)=>{
//     orders.create(req.body,(err,data)=>{
//         if(err)
//         res.send("ERRRRR!!!!!")
//         else{
//         users.findOne({'_id':req.params.id}).then((fail,success)=>{
//             if(fail)
//             res.send("failed update!!!!")
//             else{
//                 success.cart.push(req.params.ido)
//                 success.save()
//                 res.send("exchange order added and updated in user!!!")
//             }
//         })
//     }})   
// })

router.post("/createorder/:id",async(req,res)=>{
    await orders.create(req.body,(error,data)=>{
        if(error){
            console.log(error)
            res.send("Failed")
        }
        else{
            users.findOne({"_id":req.params.id},{}).then((dta,err)=>{
                dta.orders.push(data._id)
                dta.cart.splice(0,dta.cart.length)
                dta.save()
            })
            Promise.all(
                data.sellerId.map((cust,index)=>{
                    users.findOne({"_id":cust},{}).then((dta,err)=>{
                        for(let i = 0; i<data.cart.length;i++){
                            if(dta.ads.includes(data.cart[i])){
                                dta.ads.remove(data.cart[i])
                                dta.save()
                            }
                        }
                    })
                })
            )
            Promise.all(
                data.cart.map((item,index)=>{
                    product.deleteOne({"_id":item}).then((dt,er)=>{
                        console.log(dt)
                    })
                })
            )
            res.send("Success")
        }
    })
})

router.post("/exchangecreateorder/:fid/:sid",async(req,res)=>{
    await exchangeorders.create(req.body,(error,data)=>{
        if(error){
            console.log(error)
            res.send("Failed")
        }else{
            users.findOne({"_id":req.params.fid},{}).then((dta,err)=>{
                dta.orders.push(data._id)
                dta.ads.remove(data.firstProductId)
                dta.save()
            })
            users.findOne({"_id":req.params.sid},{}).then((dta,err)=>{
                dta.orders.push(data._id)
                dta.ads.remove(data.secondProductId)
                dta.save()
            })
            // product.findOne({"_id":data.firstProductId},{}).then((dta,err)=>{
            //     dta.offers.splice(0,dta.offers.length)
            //     dta.save()
            // })
            product.deleteOne({"_id":data.firstProductId}).then((dt,er)=>{
                console.log(dt)
            });
            product.deleteOne({"_id":data.secondProductId}).then((dt,er)=>{
                console.log(dt)
            });
            res.send("Success")
        }
    })   
})

module.exports = router;