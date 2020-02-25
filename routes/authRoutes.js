const router = require('express').Router()
const passport = require('../config/passport')
/*const sessionCheck = (req, res, next) => {
    if(req.user){  
        res.redirect('/profile/home')
    }else{
        next()
    }
}*/

// Routes Prefix: /auth
router.get('/', (req, res, next) => {
    res.render('auth')
})

router.get('/google', passport.authenticate('google', {
    scope:[
        'profile',
        'email'
    ]
}))

router.get('/google/redirect', passport.authenticate('google', {scope:'email'}), (req, res, next) => {
    console.log(`Google User >>> ${req.user}`)
    res.render('profile', req.user)
})

module.exports = router