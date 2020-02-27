const router = require('express').Router()
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

module.exports = router