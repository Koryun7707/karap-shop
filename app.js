require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
const ShippingAddress = require('./models/shipingAddress');


mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true}, () => {
    console.log('Connected to database');
});

// Passport Config
require('./auth/passport')(passport);

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.static("./public"))//href="./public/css/style.css"


// Express session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true
    })
);
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});


app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXhKNfoEALsLzAgqE9xrmLyDRWmaKq8qp9DfWV1o3Zj7PfxKvyLCy8qyQcIGDNkKqbXMZDVmmyHH-0IY',
    'client_secret': 'EH0QllZbxmHclQfyELMxQjeIaA_ccgCEm9gkbRUrA_ewa5abiyqul68uNK8-nW76ar8L11UULfbLz9m1'
});
app.post('/pay', function(req, res){
    //build PayPal payment request
    console.log(111122212121212)
    const order = JSON.parse(req.body.order);
    const {deliveryPrice} = JSON.parse(req.body.shippingAddress)
    const shippingAddress = req.body.shippingAddress
    let subTotal =0 ;
    order.forEach((item)=> {
        subTotal += Number(item.priceSale.substring(0, item.priceSale.length - 1));
    })
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items":  order.map((order) => {
                    return {
                        name: order.name,
                        sku: order._id,
                        price:order.onePrice,
                        currency: "USD",
                        quantity: order.count
                    }
                }),
            },
            "amount": {
                "currency": "USD",
                "total": eval(subTotal+deliveryPrice),
                "details": {
                    "subtotal": subTotal,
                    "tax": 0,
                    "shipping":deliveryPrice
                }
            },
            "description": "This is the payment description."
        }]
    };
    localStorage.setItem('amount',JSON.stringify({subTotal:subTotal,deliveryPrice:deliveryPrice}));
    localStorage.setItem('order',JSON.stringify(order));
    localStorage.setItem('shippingAddress',shippingAddress);
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                   return res.redirect(payment.links[i].href);
                }
            }

        }
    });
});
app.get  ('/success', async (req, res) => {
    try{
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const amount = JSON.parse(localStorage.getItem('amount'));
        console.log(amount.subTotal)
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": eval(amount.subTotal + amount.deliveryPrice),
                    "details": {
                        "subtotal":amount.subTotal,
                        "tax": 0,
                        "shipping":amount.deliveryPrice
                    }
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                const order = JSON.parse(localStorage.getItem('order'));
                const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));
                console.log(order)
                console.log(shippingAddress)

                let shipping = new ShippingAddress({
                    userId: req.session.user._id,
                    address: shippingAddress.address,
                    apartment: shippingAddress.apartment,
                    city: shippingAddress.city,
                    country: shippingAddress.country,
                    phone: shippingAddress.phone,
                    productIds: order,
                });
                shipping.save();
                // console.log(JSON.stringify(payment));
                req.flash('success_msg','Pay Completed');
                return res.redirect('/shipping');
            }
        })
    }catch (e){
        logger.error(`Payment Success Error: ${e}`)
        req.flash('error_msg',`Pay Error ${e}`)
        res.redirect('/shipping');
    }


});
app.get('/cancel', (req, res) => res.send('Cancelled'));
app.use('/', apiRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});