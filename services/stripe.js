const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentStripe = (req,res)=>{
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
}
module.exports ={
    paymentStripe,paymentStripe
}

