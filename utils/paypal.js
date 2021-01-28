const paypal = require('paypal-rest-sdk');

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AXhKNfoEALsLzAgqE9xrmLyDRWmaKq8qp9DfWV1o3Zj7PfxKvyLCy8qyQcIGDNkKqbXMZDVmmyHH-0IY',
    'client_secret': 'EH0QllZbxmHclQfyELMxQjeIaA_ccgCEm9gkbRUrA_ewa5abiyqul68uNK8-nW76ar8L11UULfbLz9m1'
});
app.post('/pay', function(req, res){
    //build PayPal payment request
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
            "items": [{
                "name": "item",
                "sku": "item",
                "price": "1.00",
                "currency": "USD",
                "quantity": 1
            }]
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
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});
