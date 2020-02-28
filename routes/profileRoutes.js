const router = require('express').Router()
const User = require('../models/User')
const sessionCheck = (req, res, next) => req.user ? next() : res.redirect('/auth')

// profile prefix

// Profile page
router.get('/', sessionCheck, (req, res) => {
    res.render('profile', {user:req.user})
})

// Logout redirect to index
router.get('/logout', sessionCheck, (req, res) => {
    req.logout()
    res.redirect('/')
})

router.get('/delete-account', sessionCheck, (req, res) => {
    res.render('delete-account')
})

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