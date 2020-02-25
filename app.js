require('dotenv').config()

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const favicon = require('serve-favicon')
const hbs = require('hbs')
const mongoose = require('mongoose')
const logger = require('morgan')
const path = require('path')
const session = require('express-session')
//const passport = require('')

// MongoDB Setup
mongoose
  .connect(process.env.MONGO_SRV, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(x => console.log(`Connected to MongoDB! Database name: "${x.connections[0].name}"`))
  .catch(err => console.log(`Error connecting to MongoDB :(`, err))
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const app_name = require('./package.json').name
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`)

const app = express()

// Middleware Setup
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Session Setup
app.use(session(
  {
    secret:process.env.SESSION_SECRET,
    cookie:{
      maxAge:1000*60*60*24
    },
    resave:true,
    saveUninitialized:true
  }
))

// Passport Setup
//app.use(passport.initialize())

// Passport Session Setup
//app.use(passport.session())

// Espress View Engine Setup
app.use(require('node-sass-middleware')(
  {
    src:path.join(__dirname, 'public'),
    dest:path.join(__dirname, 'public'),
    sourceMap:true
  }
))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// default value for title local
app.locals.title = 'urVoice - by DanielIvan0'

const index = require('./routes/index')
app.use('/', index)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

//const authRoutes = require('./routes/authRoutes')
//app.use('/auth', authRoutes)

module.exports = app