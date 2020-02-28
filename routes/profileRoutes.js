const router = require('express').Router()
const User = require('../models/User')
const sessionCheck = (req, res, next) => req.user ? next() : res.redirect('/auth')

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
        await User.findOneAndUpdate({email:currentEmail}, {
            displayName,
            college,
            occupation:[
                {
                    student:occupation == '0' ? true : false,
                    teacher:occupation == '1' ? true : false,
                    admin:occupation == '2' ? true : false
                }
            ],
            degree
        })
        if(currentEmail != email){
            res.redirect('/edit-profile/otp/redirect')
        }else{
            res.redirect('/profile')
        }
    }catch(e){
        res.send(e)
    }
})

// Edit Account Redirect OneTimePassword
router.get('/edit-profile/otp/redirect', async (req, res) => {
    res.send('Are you sure you want to change your email?')
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