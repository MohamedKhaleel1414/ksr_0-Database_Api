const express = require('express');
const multer = require("multer");
const path = require('path');
const router = express.Router();
const product = require('../model/product');
const users = require('../model/users');
const category = require('../model/category')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + file.originalname)
    }
});
const multi_upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    }
});

router.get("/products", function (req, res) {
    product.find().then((data, err) => {
        if (err)
            res.send(err)
        else
            res.send(data)
    })
})

router.get("/products/:pid", function (req, res) {
    product.find({ "_id": req.params.pid }, {}).then((data, err) => {
        if (err)
            res.send(err)
        else
            res.send(data)
    })
})

// router.get("/productsofcategory/:catId", function (req, res) {
//     product.find({and:[{ "status": "active" }, { "categoryId": req.params.catId }]}, {}).then((data, err) => {
//         if (err)
//             res.send(err)
//         else
//             res.send(data)
//     })
// })

router.get("/productsofcategory/:catId", function (req, res) {
    product.find({ "categoryId": req.params.catId }, {}).then((data, err) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(data)
        }

    })
})

router.get("/productsbrand/:brand", function (req, res) {
    product.find({ "brand": req.params.brand }, {}).then((data, err) => {
        if (err) {
            res.send(err)
        }
        else {
            res.send(data)
        }

    })
})

router.get("/categories", async (req, res) => {
    try {
        let categories = await category.find({});
        res.send(categories);
    } catch (err) {
        res.send(err);
    }
});

router.get("/categories/:categoryId", async (req, res) => {
    try {
        let categories = await category.findOne({ "_id": req.params.categoryId });
        res.send(categories);
    } catch (err) {
        res.send(err);
    }
});

router.post("/add/:userId", multi_upload.array("img", 10), function (req, res) {
    let imgarry = [];
    for (const a of req.files) {
        imgarry.push(a.path);
    }
    req.body.img = imgarry;
    req.body.userId = req.params.userId;
    product.create(req.body, function (err, data) {
        if (err) {
            res.end();
        } else {
            users
                .updateOne({ _id: req.params.userId }, { $push: { ads: data._id } })
                .then((response) => res.send("success"))
                .catch((err) => res.send("failed"));
        }
    });
});

router.get("/getProduct/:productId", function (req, res) {
    let productData;
    product
        .findOne({ _id: req.params.productId })
        .then((data) => {
            productData = data;
            category
                .findOne(
                    { _id: data.categoryId },
                    {
                        _id: 0,
                        "firstFilter.title": 1,
                        "secondFilter.title": 1,
                        "thirdFilter.title": 1,
                    }
                )
                .then((data) => {
                    res.send({ data: productData, category: data });
                })
                .catch((err) => res.send(err));
        })
        .catch((err) => {
            res.send(err);
        });
});

//Append Offer
router.post("/sendoffer/:wanted/:offerd", async function (req, res) {
    await product.findOne({ "_id": req.params.wanted }, {}).then((data, err) => {
        if (!data.offers.includes(req.params.offerd)) {
            data.offers.push(req.params.offerd)
            data.save()
            res.send(data)
        }
        else {
            res.send(err)
        }
    })
})

//Get Products Offered for some product
router.get("/getoffers/:pid", async function (req, res) {
    let offer = []
    let dta = []
    await product.findOne({ "_id": req.params.pid }, {}).then((data, err) => {
        offer.push(data.offers)
    })
    await Promise.all(
        offer.map(async (item, index) => {
            await product.find({ "_id": item }, {}).then((data, err) => {
                dta = [...data]
            })
        })
    )
    res.send(dta)
})

module.exports = router;