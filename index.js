const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const products = require("./db/products");
const Jwt = require('jsonwebtoken');
const jwtkey = 'e-comm'

const app = express();
app.use(express.json()); //middleware       
app.use(cors());
app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({ result }, jwtkey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ 'result': 'Internal Server Error' })
        }
        res.send({ result, auth: token });
    })
});

app.post("/login", async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select("-password");
        if (user) {
            Jwt.sign({ user }, jwtkey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: 'Internal Server Error' })
                }
                res.send({ user, auth: token });
            })

        } else {
            res.send({ result: "no User found" });
        }
    } else {
        res.send({ result: "no User found" });
    }
});

app.post('/add-product', async (req, res) => {
    let product = new products(req.body);
    let result = await product.save();
    res.send(result);
});

app.get('/get-products', async (req, res) => {
    let data = await products.find({});
    if (data.length > 0) {
        res.send(data);
    } else {
        res.send({ result: 'No Product Found' });
    }
});

app.get('/product/:_id', async (req, res) => {
    let data = await products.findOne(req.params);
    if (data) {
        res.send(data);
    } else {
        res.send({ result: 'No Product Found' });
    }

});

app.delete('/product/:_id', async (req, res) => {
    let data = await products.deleteOne(req.params);
    res.send(data);
});

app.put('/product/update/:_id', async (req, res) => {
    let data = await products.updateOne(req.params, { $set: req.body });
    res.send(data);
});

app.get('/product/search/:key', async (req, res) => {
    let data = await products.findOne({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { category: { $regex: req.params.key } }

        ]
    })
    if (data.length > 0) {
        res.send(data);
    } else {
        res.send({ result: 'No Result Found' })
    }
})



app.listen(4500);
