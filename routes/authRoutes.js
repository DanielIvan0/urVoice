const router = require('express').Router()
const passport = require('../config/passport')
const sessionCheck = (req, res, next) => req.user ? res.redirect('/') : next()

// Routes Prefix: /auth
router.get('/', sessionCheck, (req, res, next) => {
    res.render('auth')
})

router.post('/login', sessionCheck, passport.authenticate('local', {
    failureRedirect:'/signup',
    successRedirect:'/',
    failureFlash:true
}), (req, res) => {
    res.redirect('/')
})

router.get('/google', sessionCheck, passport.authenticate('google', {
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