const express = require('express')
const router = express.Router()

function loadIndex(hooksHandler) {
  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', {
      title: 'HookHub',
      hooks: hooksHandler.getModulesList()
    })
  })

  return router
}

module.exports = loadIndex
