const paypal = require('paypal-rest-sdk');
const {logger} = require('../utils/logger');
const {sendMessageToMail} = require('./mailService');
const ShippingAddress = require('../models/shipingAddress');
const ejs = require('ejs');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXhKNfoEALsLzAgqE9xrmLyDRWmaKq8qp9DfWV1o3Zj7PfxKvyLCy8qyQcIGDNkKqbXMZDVmmyHH-0IY',
    'client_secret': 'EH0QllZbxmHclQfyELMxQjeIaA_ccgCEm9gkbRUrA_ewa5abiyqul68uNK8-nW76ar8L11UULfbLz9m1'
});
const paymentPaypal = (req, res) => {
    logger.info('Start paymant with paypal - - -');
    const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));
    const {deliveryPrice} = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
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
            "return_url": `${process.env.CLIENT_URL}/success`,
            "cancel_url": `${process.env.CLIENT_URL}/cancel`
        },
        "transactions": [{
            "item_list": {
                "items": order.map((order) => {
                    return {
                        name: order.name,
                        sku: order._id,
                        price: order.onePrice,
                        currency: "EUR",
                        quantity: order.count
                    }
                }),
            },
            "amount": {
                "currency": "EUR",
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
                    return res.redirect(payment.links[i].href);
                }
            }

        }
    });
}
const paypalSuccess = (req, res) => {
    try {
        const payerId = req.query.PayerID;
        const paymentId = req.query.paymentId;
        const amount = JSON.parse(localStorage.getItem(`amount${req.session.user._id}`));
        const execute_payment_json = {
            "payer_id": payerId,
            "transactions": [{
                "amount": {
                    "currency": "EUR",
                    "total": eval(amount.subTotal + amount.deliveryPrice),
                    "details": {
                        "subtotal": amount.subTotal,
                        "tax": 0,
                        "shipping": amount.deliveryPrice
                    }
                }
            }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));
                const shippingAddress = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
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
                ejs.renderFile("./orderEmailTemplate.ejs", { name: req.session.user.firstName ,
                    date:shipping.date,
                    orderId:shipping._id,
                    order:order,
                    subTotal:amount.subTotal,
                    shipping:amount.deliveryPrice,
                    total:eval(amount.subTotal + amount.deliveryPrice)
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        const attachments = [];
                        order.forEach((item)=>{
                            attachments.push({
                                filename:item.images.split('/')[2],
                                path:`./public/${item.images}`,
                                cid:item.productId
                            })
                        })
                        const messageUser = {
                            from: process.env.MAIL_AUTH_EMAIL,
                            to: req.session.user.email,
                            subject: 'Thank you for your order',
                            html: data,
                            attachments: attachments
                        }
                        sendMessageToMail(messageUser)
                    }
                });
                ejs.renderFile("./orderEmailTemplateAdmin.ejs", {
                    name: req.session.user.firstName ,
                    email:req.session.user.email,
                    phone:shipping.phone,
                    city:shipping.city,
                    country:shipping.country,
                    apartment:shipping.apartment,
                    address:shipping.address,
                    date:shipping.date,
                    orderId:shipping._id,
                    order:order,
                    subTotal:amount.subTotal,
                    shipping:amount.deliveryPrice,
                    total:eval(amount.subTotal + amount.deliveryPrice)
                }, function (err, data) {
                    if (err) {
                        console.log(err);
                    } else {
                        const attachments = [];
                        order.forEach((item)=>{
                            attachments.push({
                                filename:item.images.split('/')[2],
                                path:`./public/${item.images}`,
                                cid:item.productId
                            })
                        })
                        const messageAdmin = {
                            from: process.env.MAIL_AUTH_EMAIL,
                            to: process.env.MAIL_AUTH_EMAIL,
                            subject: 'Thank you for your order',
                            html: data,
                            attachments: attachments
                        }
                        sendMessageToMail(messageAdmin)
                    }
                });

                localStorage.removeItem(`order${req.session.user._id}`);
                localStorage.removeItem(`shippingAddress${req.session.user._id}`);
                localStorage.removeItem(`amount${req.session.user._id}`);

                // console.log(JSON.stringify(payment));
                if (req.session.language === 'eng'){
                    req.flash('success_msg', 'Pay Completed.');
                }else {
                    req.flash('success_msg', 'Վճարն ավարտված է:');
                }
                return res.redirect('/selectedProducts');
            }
        })
    } catch (e) {
        localStorage.removeItem(`order${req.session.user._id}`);
        localStorage.removeItem(`shippingAddress${req.session.user._id}`);
        localStorage.removeItem(`amount${req.session.user._id}`);
        logger.error(`Payment Success Error: ${e}`)
        if (req.session.language === 'eng'){
            req.flash('error_msg', `Pay Error ${e}`)
        }else {
            req.flash('error_msg', 'Վճարման սխալ:');
        }
        res.redirect('/shipping');
    }

}
const paypalCancel = (req, res) => {
    localStorage.removeItem(`order${req.session.user._id}`);
    localStorage.removeItem(`shippingAddress${req.session.user._id}`);
    localStorage.removeItem(`amount${req.session.user._id}`);
    res.send('Cancelled')
}

module.exports = {
    paymentPaypal: paymentPaypal,
    paypalSuccess: paypalSuccess,
    paypalCancel: paypalCancel
};