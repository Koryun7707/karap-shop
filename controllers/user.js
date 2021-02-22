require('dotenv').config();
const {sendMessageToMail} = require('../services/mailService')
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

const sendMessageContactUs = async (req, res) => {
    try {
        const {email, firstName, message} = req.body
        const content = {
            from: process.env.MAIL_AUTH_EMAIL,
            to: email,
            subject: 'Message to user',
            html: `<h2>${firstName}</h2>
                       <h4>${email} </h4>
                               <div>
                                   <p>
                                    ${message}
                                    </p> 
                                </div> `,
        }
        await sendMessageToMail(content);
        if (req.session.language == 'eng') {
            req.flash("success_msg", 'Your message is sended!');
        } else {
            req.flash('success_msg', 'Ձեր հաղորդագրությունն ուղարկված է:');
        }
        return res.redirect("/contact");

    } catch (err) {
        console.log(err)
        req.flash("error_msg", err.message);
        return res.redirect("/contact");
    }
};

const signUp = async (req, res, next) => {
    passport.authenticate('signup', {}, async (error, user, message) => {
        try {
            if (error || !user) {
                req.flash('error_msg', message.message);
                return res.redirect('/signup');
            }
                const token = jwt.sign({
                    user: user
                }, process.env.SECRET_KEY, {
                    expiresIn: '5m',
                },);
                const content = {
                    from: process.env.MAIL_AUTH_EMAIL,
                    to: user.email,
                    subject: 'Account activation on Armat Concept',
                    html: `<!DOCTYPE html>
                    <html lang="en">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>HOME</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.1/css/all.min.css"
          integrity="sha512-+4zCK9k+qNFUR5X+cKL9EIR+ZOhtIloNl9GIKS57V1MyNsYpYcUrUeQc9vNfzsWfV28IaLL3i96P9sdNyeRssA==" crossorigin="anonymous" />
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Benne&family=Oswald:wght@400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
<table style="max-width: 700px; width: 100%"  border="0" align="center" cellpadding="0" cellspacing="0">
    <tbody>
    <tr>
        <td align="center" >
            <table  border="0" align="center" cellpadding="0" cellspacing="0" style="margin-right:20px; ">
                <tbody>
                <tr>
                    <td  align="center" style="font-family: 'Oswald', sans-serif; font-size:22px; letter-spacing: 3px; font-weight: 500; color:#2a3a4b;padding: 40px 0 20px">
                        <div style="text-align: left; font-size:14px; line-height: 20px; letter-spacing: 1px;margin-top: 20px; padding-left: 20px">
                            <div><b>Hi ${user.firstName}</b></div>
                            <div><b>Thank you for registration  with  Armat  Concept</b></div>
                            <div><b>In order to activate your account please click the button below</b></div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td style="text-align: center">

                            <a href="https://armatconcept.com/activate-account/${token}">
                                <button class="btn btn-success">
                                    Activate account
                                </button>
                            </a>

                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    </tbody>
</table>

</body>
</html>

 `,
                }
                await sendMessageToMail(content);
                if (req.session.language == 'eng') {
                    req.flash('success_msg', 'Activation link sent to email. Please activate to log in.');
                } else {
                    req.flash('success_msg', 'Ակտիվացման հղումը ուղարկվել է էլ. Խնդրում ենք ակտիվացնել ՝ մուտք գործելու համար:');
                }
                return res.redirect('/signup');
        } catch (e) {
            req.flash('error_msg', e.message);
            return res.redirect('/signup');
        }
    })(req, res, next);
};

const activateAccount = async (req, res) => {
    try {
        const {token} = req.params;
        if (token) {
            const {user} = jwt.verify(token, process.env.SECRET_KEY);
            if (!user) {
                if (req.session.language == 'eng') {
                    req.flash('error_msg', 'Activation link is not valid please register again!');
                } else {
                    req.flash('error_msg', 'Ակտիվացման հղումը վավեր չէ, խնդրում ենք կրկին գրանցվել:');
                }
                return res.redirect('/signup');
            }
            const userInDb = await User.findOne({email: user.email});
            if (userInDb) {
                if (req.session.language == 'eng') {
                    req.flash('success_msg', 'Account already has been activated, you can login now.');
                } else {
                    req.flash('success_msg', 'Հաշիվն արդեն ակտիվացված է, կարող եք մուտք գործել հիմա:');
                }
                return res.redirect('/signup');
            }

            let hash = bcrypt.hashSync(user.password, 10);
            let newUser = new User({
                status: true,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: hash,
                roleType: 'user',
                avatar: user.avatar
            });
            await newUser.save();
            req.login(newUser, function (err) {
                if (err){
                    res.redirect('/signup');
                } else {
                    //handle error
                    return res.redirect('/')
                }
            })
        } else {
            if (req.session.language == 'eng') {
                req.flash('error_msg', 'Account activation error!');
            } else {
                req.flash('error_msg', 'Հաշվի ակտիվացման սխալ:');
            }
            return res.redirect('/signup');
        }
    } catch (e) {
        if (req.session.language == 'eng') {
            req.flash('error_msg', 'Account activation error,please try again!');
        } else {
            req.flash('error_msg', 'Հաշվի ակտիվացման սխալ, կրկին փորձեք:');
        }
        return res.redirect('/signup');
    }
};

module.exports = {
    sendMessageContactUs: sendMessageContactUs,
    signUp: signUp,
    activateAccount: activateAccount
}


