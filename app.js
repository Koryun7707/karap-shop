require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const {logger} = require('./utils/logger');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const apiRoutes = require('./routes');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const ShippingAddress = require('./models/shipingAddress');
const {sendMessageToMail} = require('./services/mailService');
const compression =   require('compression');
const Product = require('./models/product');

const app = express();
app.use(compression());


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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXhKNfoEALsLzAgqE9xrmLyDRWmaKq8qp9DfWV1o3Zj7PfxKvyLCy8qyQcIGDNkKqbXMZDVmmyHH-0IY',
    'client_secret': 'EH0QllZbxmHclQfyELMxQjeIaA_ccgCEm9gkbRUrA_ewa5abiyqul68uNK8-nW76ar8L11UULfbLz9m1'
});

app.post('/pay', function (req, res) {
    //build PayPal payment request
    logger.info('Start paymant with paypal - - -');
    const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));
    const {deliveryPrice} = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
    console.log(order,'order');
    console.log(deliveryPrice,'delevry');

    let subTotal = 0;
    order.forEach((item) => {
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
                "items": order.map((order) => {
                    return {
                        name: order.name,
                        sku: order._id,
                        price: order.onePrice,
                        currency: "USD",
                        quantity: order.count
                    }
                }),
            },
            "amount": {
                "currency": "USD",
                "total": eval(subTotal + deliveryPrice),
                "details": {
                    "subtotal": subTotal,
                    "tax": 0,
                    "shipping": deliveryPrice
                }
            },
            "description": "This is the payment description."
        }]
    };

    localStorage.setItem(`amount${req.session.user._id}`, JSON.stringify({
        subTotal: subTotal,
        deliveryPrice: deliveryPrice
    }));
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    return res.redirect( payment.links[i].href);
                }
            }

        }
    });
});

app.get('/success', async (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const amount = JSON.parse(localStorage.getItem(`amount${req.session.user._id}`));
        console.log(amount.subTotal)
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "USD",
                    "total": eval(amount.subTotal + amount.deliveryPrice),
                    "details": {
                        "subtotal": amount.subTotal,
                        "tax": 0,
                        "shipping": amount.deliveryPrice
                    }
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function  (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));
                const shippingAddress = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
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
                let orderUser = '';
                const ids =[];
                order.forEach(item=> {
                    ids.push(item.productId);
                    orderUser += item.name + ' ' + 'Count:' + item.count + ' ' + 'Cost:' + item.priceSale + ' ' + 'Delivery:' + shippingAddress.deliveryPrice + '</br>';
                })
                // Product.find({'$in': ids} ).populate('brandId').exec( function(err, data){
                //     if(err){
                //         console.log(err);
                //     };
                //
                //     console.log(data);
                // });
                const messageUser = {
                    from: process.env.MAIL_AUTH_EMAIL,
                    to: req.session.user.email,
                    subject: 'Thank you for your order',
                    html: `<h4>Hello ${req.session.user.firstName} </h4>
                               <div>
                                    ${orderUser}                                  
                                </div> `,
                }
                const messageAdmin = {
                    from: process.env.MAIL_AUTH_EMAIL,
                    to: process.env.MAIL_AUTH_EMAIL,
                    subject: `From website buys product ${req.session.user.firstName} | ${req.session.user.firstName} | ${req.session.user._id}`,
                    html: `
                               <div>
                                     ${orderUser}                              
                                </div> 
                                <div>
                                     ${shippingAddress}                              
                                </div>`,
                }
                sendMessageToMail(messageUser)
                sendMessageToMail(messageAdmin)

                localStorage.removeItem(`order${req.session.user._id}`);
                localStorage.removeItem(`shippingAddress${req.session.user._id}`);
                localStorage.removeItem(`amount${req.session.user._id}`);

                // console.log(JSON.stringify(payment));
                req.flash('success_msg', 'Pay Completed');
                return res.redirect('/selectedProducts');
            }
        })
    } catch (e) {
        localStorage.removeItem(`order${req.session.user._id}`);
        localStorage.removeItem(`shippingAddress${req.session.user._id}`);
        localStorage.removeItem(`amount${req.session.user._id}`);
        logger.error(`Payment Success Error: ${e}`)
        req.flash('error_msg', `Pay Error ${e}`)
        res.redirect('/shipping');
    }


});

app.get('/cancel', (req, res) => {
    localStorage.removeItem(`order${req.session.user._id}`);
    localStorage.removeItem(`shippingAddress${req.session.user._id}`);
    localStorage.removeItem(`amount${req.session.user._id}`);
    res.send('Cancelled')
});

//Stripe integration
app.post('/purchase', function (req, res) {
    const {address,postalCode,city,country,apartment,deliveryPrice} = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
    const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));
    let subTotal = 0;
    order.forEach((item) => {
        subTotal += Number(item.priceSale.substring(0, item.priceSale.length - 1));
    })
    console.log(req.body.stripeToken);
    console.log(req.body.stripeEmail);
    console.log(req.body)
    let amount = (Number(subTotal)+Number(deliveryPrice))*100;
    console.log(amount)
    console.log(Number(subTotal))
    console.log(Number(deliveryPrice))
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: req.session.user.firstName + '' + req.session.user.lastName,
        address: {
            line1:address+" "+ apartment,
            postal_code: postalCode,
            city: city,
            state: address,
            country: country,
        }
    })
        .then((customer) => {
            return stripe.charges.create({
                amount: amount,
                description: 'Armat Concept',
                currency: 'USD',
                customer: customer.id
            });
        })
        .then((charge) => {
            localStorage.removeItem(`order${req.session.user._id}`);
            localStorage.removeItem(`shippingAddress${req.session.user._id}`);
            req.flash('success_msg', 'Pay Completed');
            return res.redirect('/selectedProducts');
            // If no error occurs
        })
        .catch((e) => {
            localStorage.removeItem(`order${req.session.user._id}`);
            localStorage.removeItem(`shippingAddress${req.session.user._id}`);
            logger.error(`Payment Error: ${e}`)
            req.flash('error_msg', `Pay Error ${e}`)
            res.redirect('/shipping');
            // If some error occurs
        });
});

app.use('/', apiRoutes);

app.get('*', (req, res) => {
    logger.error(`APP INVALID ROUTE ${req.originalUrl}`)
    res.json({ status: 404, description: 'Invalid api address!' })
});
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});