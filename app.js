const express = require('express')
const path = require('path')
// const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const debug = require('debug')('hookhub:app')
const app = express()
const { getLine } = require('./lib/utils')

var hookhub = require('./hookhub')
var index = require('./routes/index')(hookhub)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))

// Intercept req.rawBody
app.use(bodyParser.json({
  verify: function (req, res, buf, encoding) {
    // get rawBody
    req.rawBody = buf.toString(encoding)
  }
}))

// JSON body parser fixes
app.use(bodyParser.urlencoded({
  extended: false
}))

// General Express settings
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

debug(getLine(), 'Adding / handler')
app.use('/', index)

debug(getLine(), 'Adding /hooks/ stub-handler')
app.use('/hooks/', hookhub.hooks)

debug(getLine(), 'before')
loadHookhub()
debug(getLine(), 'after')

// catch 404 and forward to error handler
debug(getLine(), 'Adding 404')
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
debug(getLine(), 'Adding error handler')
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app

async function loadHookhub () {
  let initResult = await hookhub.init()
  if (!initResult) throw new Error('Fatal Hookhub init error')
  debug(getLine(), 'Hookhub Initialized')
  return initResult
}
