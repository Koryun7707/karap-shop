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
const  {LocalStorage} =   require ("node-localstorage");
localStorage = new LocalStorage('./scratch')


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
    const order = JSON.parse(req.body.order);
    console.log(order);
    const array  = []
    let total = 0 ;
    order.forEach((item)=>{
        let newObj = {
            name: item.name,
            sku: item.name,
            price: item.priceSale.substring(0,item.priceSale.length - 1),
            currency: "USD",
            quantity: item.count
        }
        array.push(JSON.parse(JSON.stringify(newObj)));
        total+= Number(item.priceSale.substring(0,item.priceSale.length - 1));
    })
    console.log(array)
    console.log(total)
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
                "items": array
            },
            "amount": {
                "currency": "USD",
                "total": "1.00"
            },
            "description": "This is the payment description."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i = 0;i < payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                    console.log(666);

                   return res.redirect(payment.links[i].href);
                }
            }

        }
    });
});
app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            console.log(JSON.stringify(payment));
            res.send('Success');
        }
    });
});
app.get('/cancel', (req, res) => res.send('Cancelled'));
app.use('/', apiRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});