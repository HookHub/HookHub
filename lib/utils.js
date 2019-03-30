'use strict'

const realIsInstalled = require('is-installed')

function getLine () {
  return ((new Error().stack).split('at ')[2]).trim().split(':')[1]
}

module.exports.getLine = getLine

function Fatal (err) {
  console.warn('Fatal error:', err)
  return process.exit(1)
}

module.exports.Fatal = Fatal

function stackDump (router) {
  return function (req, res, next) {
    var routes = router.stack
    var table = []
    for (var key in routes) {
      if (routes.hasOwnProperty(key)) {
        var val = routes[key]
        if (val.route) {
          val = val.route
          var _o = {}
          _o[val.stack[0].method] = [val.path]
          table.push(_o)
        }
      }
    }
    return table
  }
}

module.exports.stackDump = stackDump

var nodeMode = process.env.NODE_ENV ? process.env.NODE_ENV : 'development'

function dummyLoader () { return (function () {})() }

function isDebug () {
  return process.env.hasOwnProperty('DEBUG')
}

function isDevelopment () {
  return nodeMode !== 'production'
}

function isInstalled (nodeModule) {
  return realIsInstalled.sync(nodeModule)
}

function isProduction () {
  return nodeMode === 'production'
}

function requireDebug (nodeModule) {
  if (isDebug() && isInstalled(nodeModule)) { return require(nodeModule) }

  return dummyLoader
}

function requireDevelopment (nodeModule) {
  if (isDevelopment() && isInstalled(nodeModule)) { return require(nodeModule) }

  return dummyLoader
}

function requireInstalled (nodeModule) {
  if (isInstalled(nodeModule)) { return require(nodeModule) }

  return dummyLoader
}

module.exports.isDebug = isDebug
module.exports.isDevelopment = isDevelopment
module.exports.isInstalled = isInstalled
module.exports.isProduction = isProduction
module.exports.requireDebug = requireDebug
module.exports.requireDevelopment = requireDevelopment
module.exports.requireInstalled = requireInstalled
