const router = require('express').Router()
const passport = require('../config/passport')
const crazyString = require('randomstring')
const nodemailer = require('nodemailer')
const User = require('../models/User')
const crypto = require('crypto')
const sessionCheck = (req, res, next) => req.user ? res.redirect('/') : next()

// signup Routes
router.get('/', sessionCheck, (req, res, next) => {
    res.render('signup')
})

// Route for the One Time Password
router.post('/otp', sessionCheck, async (req, res, next) => {
    const {displayName, email} = req.body
    if(email){
        //Send OTP
        try{
            const currentUser = await User.findOne({email})
            if(currentUser && currentUser.status){
                res.send('The email is already verified.')
            }else{
                // Let's verify the account
                // Generate token
                console.log(1)
                const token = crazyString.generate({
                    length:6,
                    capitalization:'uppercase'
                })
                const cipher = crypto.createCipher(process.env.CRYPT_ALGORITHM, process.env.CRYPT_KEY)
                let encrypted = cipher.update(token, 'utf8', 'hex')
                encrypted += cipher.final('hex')
                console.log(2)
                var updatedUser = await User.findOneAndUpdate({
                    email:email,
                    status:false
                }, {
                    otp:encrypted
                })
                console.log(3)
                if(!(updatedUser)){
                    updatedUser = await new User(
                        {
                            email,
                            displayName,
                            otp:encrypted,
                        }
                    ).save()
                }
                console.log(4)
                if(updatedUser){
                    console.log(console.log(5))
                    const tokenHTML = `
                        <h2>Hi, ${displayName}!</h2>
                        <h3>Thank you very much for joining our network.</h3>
                        <h3>We promise never share your data.</h3>
                        <p>Your verification code is: ${token}</p>
                    `
                    const transporter = nodemailer.createTransport({
                        host:process.env.HOST,
                        port:parseInt(process.env.EMAIL_PORT),
                        auth: {
                            user:process.env.EMAIL,
                            pass:process.env.EMAIL_PWD
                        }
                    })
                    await transporter.sendMail({
                        from:`urVoice team: <${process.env.EMAIL}>`,
                        to:updatedUser.email,
                        subject:'Verification code.',
                        text:'This is the text',
                        html:tokenHTML
                    })
                    console.log(6)
                    res.render('otp', {email:updatedUser.email})
                }else res.send('Error')
            }
        }catch(e){
            res.send('We couldn\'t send the email. Please try again. ' + e)
        }
    }else res.redirect('/signup') // Something is missing
})

// Google Authentication
router.get('/google', sessionCheck, (req, res, next) => {
    global.isAuth = false
    next()
}, passport.authenticate('google', {
    scope:[
        'profile',
        'email'
    ]
}))

module.exports = router