var express = require('express')
var router = express.Router()

function loadIndex (bootstrap) {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'HookHub',
      hooks: Object.keys(bootstrap.getHooks())
    })
  })

  return router
}

module.exports = loadIndex
