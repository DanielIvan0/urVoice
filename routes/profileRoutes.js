const router = require('express').Router()
const User = require('../models/User')
const crypto = require('crypto')
const crazyString = require('randomstring')
const nodemailer = require('nodemailer')
const sessionCheck = (req, res, next) => req.user ? next() : res.redirect('/auth')
const otpGenerator = (
    token = crazyString.generate({
        length:6,
        capitalization:'uppercase'
    })
) => {
    const cipher = crypto.createCipher(process.env.CRYPT_ALGORITHM, process.env.CRYPT_KEY)
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return [token, encrypted]
}
const sendMail = async (email, token, displayName) => {
    const tokenHTML = `
        <h2>Hi, ${displayName}!</h2>
        <h3>Good to see you again!</h3>
        <h3>Continue enjoying our network.</h3>
        <p>Your verification code is: ${token}</p>
    `
    const transporter = nodemailer.createTransport({
        service:'Gmail',
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
}


// profile prefix
// Profile page
router.get('/', sessionCheck, (req, res) => {
    res.render('profile', {user:req.user})
})

// Edit Account page
router.get('/edit-profile', sessionCheck, (req, res) => {
    res.render('edit-profile', {user:req.user})
})

// Edit Account Redirect
router.post('/edit-profile/redirect', sessionCheck, async (req, res) => {
    const {displayName, email, college, occupation, degree} = req.body
    const currentEmail = req.user.email
    try{
        // Update User
        const token = currentEmail != email ? otpGenerator() : null
        await User.findOneAndUpdate({email:currentEmail}, {
            displayName,
            college,
            occupation:{
                student:occupation == '0' ? true : false,
                teacher:occupation == '1' ? true : false,
                admin:occupation == '2' ? true : false
            },
            degree,
            otp:currentEmail != email ? token[1] : 0,
            email2:currentEmail != email ? email : 0
        })
        if(currentEmail != email){
            //Redirect
            res.redirect('/profile/edit-profile/otp')
        }else{
            res.redirect('/profile')
        }
    }catch(e){
        res.send(e)
    }
})

// Edit Account Send Email with the OneTimePassword
router.get('/edit-profile/otp', sessionCheck, async (req, res) => {
    const {email2, otp, displayName} = req.user
    try{
        const decipher = crypto.createDecipher(process.env.CRYPT_ALGORITHM, process.env.CRYPT_KEY)
        let decrypted = decipher.update(otp,'hex', 'utf8')
        decrypted += decipher.final('utf8')
        sendMail(email2, decrypted, displayName)
        res.render('otp', {
            msg:`If you want to change your email, then verify your account with the authentication code we send to ${email2}.`,
            msgType:'warning',
            editProfile:true,
            email:''
        })
    }catch(e){
        res.send('Something were wrong.')
    }
})

// OneTimePassword Redirect
router.post('/edit-profile/otp/redirect', sessionCheck, async (req, res) => {
    // Check if the current Password is correct
    const {password} = req.body
    const {email, email2, otp} = req.user
    if(otpGenerator(password)[1] === otp){
        try{
            const currentUser = await User.findOneAndUpdate({email}, {
                email:email2,
                email2:'',
                otp:0
            })
            req.user = currentUser
            res.redirect('/profile')
        }catch(e){
            res.send('Error: ' + e)
        }
    }else{
        res.render('otp', {
            msg:'The one-time password is incorrect!',
            msgType:'danger',
            email:''
        })
    }
})

// Logout redirect to index
router.get('/logout', sessionCheck, (req, res) => {
    req.logout()
    res.redirect('/')
})

// Delete Account Confirmation page
router.get('/delete-account', sessionCheck, (req, res) => {
    res.render('delete-account')
})

// Delete Account Redirect
router.get('/delete-account/redirect', sessionCheck, async (req, res) => {
    const {email} = req.user
    try{
        await User.findOneAndDelete({email:req.user.email})
        res.redirect('/profile/logout')
    }catch(e){
        res.send('Something were wrong deleting your account: ' + e)
    }
})

module.exports = router