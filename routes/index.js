const express = require('express')
const router  = express.Router()
const passport = require('../config/passport')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('index')
})

router.get('/profile', (req, res, next) => {
  console.log(req.user)
})

module.exports = router
