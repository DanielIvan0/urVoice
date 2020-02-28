const router = require('express').Router()
const passport = require('../config/passport')
const User = require('../models/User')
const crazyString = require('randomstring')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sessionCheck = (req, res, next) => req.user ? res.redirect('/') : next()

// Routes Prefix: /auth
router.get('/', sessionCheck, (req, res, next) => {
    res.render('auth')
})

router.post('/otp', sessionCheck, async (req, res, next) => {
    const {email} = req.body
    if(email){
        try{
            const currentUser = await User.findOne({email:email})
            if(currentUser && currentUser.status){
                // It's all OK, let's verify the account
                // Generate token
                const token = crazyString.generate({
                    length:6,
                    capitalization:'uppercase'
                })
                const cipher = crypto.createCipher(process.env.CRYPT_ALGORITHM, process.env.CRYPT_KEY)
                let encrypted = cipher.update(token, 'utf8', 'hex')
                encrypted += cipher.final('hex')
                var updatedUser = await User.findOneAndUpdate({
                    email:currentUser.email,
                    status:true
                }, {
                    otp:encrypted
                })
                if(updatedUser){
                    const tokenHTML = `
                        <h2>Hi, ${updatedUser.displayName}!</h2>
                        <h3>Good to see you again!</h3>
                        <h3>Continue enjoying our network.</h3>
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
                        to:email,
                        subject:'Verification code.',
                        text:'This is the text',
                        html:tokenHTML
                    })
                    res.render('otp', {email})
                }else res.send('Error in the Data Base')
            }else{
                res.send('You are not registered or your account is disabled.')
            }
        }catch(e){
            res.send('We couldn\'t send the email. Please try again. ' + e)
        }
    }else res.send('There is something missing!')
})

router.post('/login', sessionCheck, passport.authenticate('local', {
    failureRedirect:'/auth',
    successRedirect:'/',
    failureFlash:true
}))

router.get('/google', sessionCheck, (req, res, next) => {
    global.isAuth = true
    next()
}, passport.authenticate('google', {
    scope:[
        'profile',
        'email'
    ]
}))

router.get('/google/redirect', sessionCheck, passport.authenticate('google', {
    scope:'email',
    failureRedirect:'/auth'
}), (req, res) => {
    res.redirect('/')
})

module.exports = router