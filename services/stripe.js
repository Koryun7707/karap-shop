const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {sendMessageToMail} = require('./mailService');
const ShippingAddress = require('../models/shipingAddress');


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
    })
    console.log(req.body.stripeToken);
    console.log(req.body.stripeEmail);
    console.log(req.body)
    let amount = (Number(subTotal) + Number(deliveryPrice)) * 100;
    console.log(amount)
    console.log(Number(subTotal))
    console.log(Number(deliveryPrice))
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
            });
            shipping.save();
            let orderUser = '';
            const ids = [];
            order.forEach(item => {
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
}
module.exports = {
    paymentStripe: paymentStripe,
}

