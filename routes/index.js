const express = require('express')
const router  = express.Router()
const passport = require('../config/passport')
const sessionCheck = (req, res, next) => req.user ? next() : res.redirect('/auth')

/* GET home page. */
router.get('/', sessionCheck, (req, res) => {
  res.render('index', {user:req.user})
})

module.exports = router
