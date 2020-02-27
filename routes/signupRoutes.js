const router = require('express').Router()
const passport = require('../config/passport')
const sessionCheck = (req, res, next) => req.user ? res.redirect('/') : next()

router.get('/', sessionCheck, (req, res, next) => {
    res.render('signup')
})

router.get('/google', sessionCheck, passport.authenticate('google', {
    scope:[
        'profile',
        'email'
    ]
}))

module.exports = router