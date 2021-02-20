const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {sendMessageToMail} = require('./mailService');
const ShippingAddress = require('../models/shipingAddress');
const {logger} = require('../utils/logger');
const ejs = require('ejs')
const Product = require('../models/product');

const paymentStripe = (req, res) => {
    const {
        address,
        postalCode,
        city,
        country,
        apartment,
        deliveryPrice
    } = JSON.parse(localStorage.getItem(`shippingAddress${req.session.user._id}`));
    const order = JSON.parse(localStorage.getItem(`order${req.session.user._id}`));

    let subTotal = 0;
    order.forEach((item) => {
        subTotal += Number(item.priceSale.substring(0, item.priceSale.length - 1));
    });
    let amount = (Number(subTotal.toFixed(2)) + Number(deliveryPrice.toFixed(2))) * 100;
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
        name: req.session.user.firstName + '' + req.session.user.lastName,
        address: {
            line1: address + " " + apartment,
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
                currency: 'EUR',
                customer: customer.id
            });
        })
        .then((charge) => {
            //start create user shipping address
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
                deliveryPrice:deliveryPrice
            });
            shipping.save();
            ejs.renderFile("./orderEmailTemplate.ejs", {
                name: req.session.user.firstName,
                date: shipping.date,
                orderId: shipping._id,
                order: order,
                subTotal: subTotal.toFixed(2),
                shipping: deliveryPrice.toFixed(2),
                total: amount / 100
            }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    const attachments = [];
                    order.forEach((item) => {
                        attachments.push({
                            filename: item.images.split('/')[2],
                            path: `./public/${item.images}`,
                            cid: item.productId
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
                name: req.session.user.firstName,
                lastName:req.session.user.lastName,
                email: req.session.user.email,
                phone: shipping.phone,
                city: shipping.city,
                country: shipping.country,
                apartment: shipping.apartment,
                address: shipping.address,
                date: shipping.date,
                orderId: shipping._id,
                order: order,
                subTotal: subTotal.toFixed(2),
                shipping: deliveryPrice.toFixed(2),
                total: amount / 100
            }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    const attachments = [];
                    order.forEach((item) => {
                        attachments.push({
                            filename: item.images.split('/')[2],
                            path: `./public/${item.images}`,
                            cid: item.productId
                        })
                    })
                    attachments.push({
                        filename: '2Armatconcept.png',
                        path: `./public/images/2Armatconcept.png`,
                        cid: '2Armatconcept'
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
            order.forEach(async (item) => {
                let eachProduct = await Product.findById(item.productId);
                eachProduct.count = Number(eachProduct.count) - Number(item.count);
                await eachProduct.save();
            })

            localStorage.removeItem(`order${req.session.user._id}`);
            localStorage.removeItem(`shippingAddress${req.session.user._id}`);
            if (req.session.language === 'eng') {
                req.flash('success_msg', 'Pay Completed.');
            } else {
                req.flash('success_msg', 'Վճարն ավարտված է:');
            }
            return res.redirect('/selectedProducts');
            // If no error occurs
        })
        .catch((e) => {
            localStorage.removeItem(`order${req.session.user._id}`);
            localStorage.removeItem(`shippingAddress${req.session.user._id}`);
            logger.error(`Payment Error: ${e}`)
            if (req.session.language === 'eng') {
                req.flash('error_msg', `Pay Error ${e}`)
            } else {
                req.flash('error_msg', 'Վճարման սխալ:');
            }
            res.redirect('/shipping');
            // If some error occurs
        });
}

module.exports = {
    paymentStripe: paymentStripe
}


