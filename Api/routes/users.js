const express = require('express');
const multer = require("multer");
const router = express.Router();
const users = require('../model/users');
const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const { json } = require('express');
const dotenv = require("dotenv").config();
const { middle } = require('../middleware/middleware');
const product = require('../model/product');

//////register
router.post("/register", function (req, res) {
    let cipher = crypto.createCipher("aes-256-ctr", req.body.password)
    let crypted = cipher.update(req.body.password, "utf-8", "hex")
    crypted += cipher.final("hex")
    let x = req.body
    x.password = crypted
    users.create(x, function (data, err) {
        if (err) {
            // console.log("Error!!!!!!!!!!!")
            res.send(err)
        }
        else {
            // let secret = process.env.TOKEN_SECRET;
            // let token = jwt.sign(data.email, secret);
            // res.setHeader("authorization", token)
            // console.log(req.body)
            // console.log(data)
            res.send(data)
        }
    })
})

//////Login
router.post("/login", async (req, res) => {
    try {
        let decipher = crypto.createDecipher("aes-256-ctr", req.body.password);
        let decrypted = decipher.update(req.body.password, "utf-8", "hex");
        decrypted += decipher.final("hex");
        req.body.password = decrypted;
        let result = await users.findOne({
            $and: [{ email: req.body.email }, { password: req.body.password }],
        });
        if (result) {
            let secret = process.env.TOKEN_SECRET;
            let token = jwt.sign(req.body.email, secret);
            res.setHeader("authorization", token);
            res.send(result._id);
        } else res.send("not found this user");
    } catch (err) {
        res.send("Failed");
    }
});

//Get cart items
router.get("/cartitems/:id",async function (req, res) {
    let itms=[]
    let arrr = [];
    await users.findById({ "_id": req.params.id }, {}).then((data, err) => {
        itms=[...data.cart]
    });
    await Promise.all(
        itms.map(async(item,index)=>{
            await product.find({"_id":item},{}).then((dt,er)=>{
                arrr.push(dt[0])
            })
        })
    )
    res.send(arrr)
})

//Get cart items ID
router.get("/cartitemsid/:id",async function (req, res) {
    let itms=[]
    let arrr = [];
    await users.findById({ "_id": req.params.id }, {}).then((data, err) => {
        itms=[...data.cart]
    });
    await Promise.all(
        itms.map(async(item,index)=>{
            await product.find({"_id":item},{}).then((dt,er)=>{
                arrr.push(dt[0]._id)
            })
        })
    )
    res.send(arrr)
})

//Update User from addtocart page
router.post("/confirm/:id", function (req, res) {
    users.findByIdAndUpdate({ "_id": req.params.id }, { "phone_number": Number(req.body.phone), "address": { "st": req.body.address } }).then((err, data) => {
        if (!err)
            res.send("ERR!!")
        else
            res.send("Updated!")
    })
})

//Delete item from cart
router.delete("/rmovefromcart/:id/:idp", function (req, res) {
    users.findOne({ "_id": req.params.id }).then((data, err) => {
        if (err)
            res.send("ERRRRRR!!!!!")
        else {
            data.cart.remove(req.params.idp)
            data.save()
            res.send(data)
        }
    })
})

//Add item to cart from product page
router.post("/addtocart/:id/:idp", function (req, res) {
    users.findOne({ "_id": req.params.id }, {}).then((data, err) => {
        if (err) {
            res.send(err)
        }
        else {
            const d = data.cart.includes(req.params.idp)
            if (d !== true) {
                data.cart.push(req.params.idp)
                data.save()
                res.send(data)
            }
        }
    })
}
)

//Get User Ads
router.get("/getUserAds/:id",async(req,res)=>{
    let itms=[]
    let arrrads = [];
    await users.findById({ "_id": req.params.id }, {}).then((data, err) => {
        if(data.ads.length===0){
            res.send(arrrads)
            res.end()
        }
        else{
            itms=[...data.ads]
        }
    });
    if(itms.length>0){
        await Promise.all(
            itms.map(async(item,index)=>{
                await product.find({"_id":item},{}).then((dt,er)=>{
                    arrrads.push(dt[0])
                })
            })
        )
        res.send(arrrads)
    }
})

//////////////////////////get user///////////////////////////////////
router.get("/getUser/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const user = await users.findOne({ "_id": id });
        res.send(user);
    } catch (err) {
        res.send(err);
    }
});

//////////////////////////update user info///////////////////////////////////
router.patch("/updateUser/:id", async (req, res) => {
    const body = req.body;
    const id = req.params.id;
    try {
        const user = await users.findByIdAndUpdate(id, body);
        res.send(user);
    } catch (err) {
        res.send(err);
    }
});

/////////////////////////get from wishlist/////////////////////////////
router.get("/mywishlist/:id", async (req, res) => {
    const user = await users.findById(req.params.id);

    res.send(user.wishlist);
});

//////////////////////////add to wishlist///////////////////////////////////
router.post("/wishlist/:id", async (req, res) => {
    await users.findByIdAndUpdate(req.params.id, {
        $push: { wishlist: req.body.title },
    });
    res.send("done");
});

/////////////////////////delete from wishlist/////////////////////////////
router.delete("/wishlist/:id", async (req, res) => {
    const title = req.body.title;
    const user = await users.findById(req.params.id);
    let wishlist = user.wishlist;
    wishlist = wishlist.filter((item) => {
      return item !== title;
    });
    await users.findByIdAndUpdate(req.params.id, { wishlist });
    res.send("done");
  });

///////////////////////////get userAds./////////////////////////////////
router.get("/ads/:id", async (req, res) => {
    let prodList = [];
    users.findOne({ "_id": req.params.id })
        .then(async (user) => {
            for (let i = 0; i < user.ads.length; i++) {
                let p = await product.findOne({ _id: user.ads[i] });
                prodList.push(p);
            }
            res.send(prodList);
        })
        .catch((err) => console.log(err));
});

/////////////////// deleter ads ////////////////////////

router.delete("/ads/:id/:itemId", async (req, res) => {
    const { id, itemId } = req.params;
    const user = await users.findById(id);
    let ads = user.ads;
    ads = ads.filter((objectId) => {
        return objectId.toString() !== itemId;
    });
    await users.findByIdAndUpdate(id, { ads });
    await product.findByIdAndDelete({ _id: itemId });
    res.send("done");
});

module.exports = router;