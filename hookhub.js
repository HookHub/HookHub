const debug = require('debug')('hookhub:bootstrap')
const express = require('express')
const router = express.Router()
const npm = require('npm')
const isInstalled = require('is-installed')
const { getLine } = require('./lib/utils')
const fs = require('fs')

var bootstrap
var pluginCache = {}
var resourceCache = {}

if (typeof process.env.HOOKHUB_BOOTSTRAP_MODULE === 'undefined') {
  throw new Error('Missing HOOKHUB_BOOTSTRAP_MODULE')
}

router.get('/', function (req, res, next) {
  if (!res.hookhub) res.hookhub = {}
})

async function init () {
  debug(getLine(), 'init', 'Setting up...')
  try {
    await installBootstrap()
  } catch (e) {
    throw new Error(getLine() + ': installBootstrap failed with: ' + e)
  }

  // Install plugins
  debug(getLine(), 'init', 'Installing plugins')
  let plugins = getPlugins()
  let pluginRefs = Object.keys(plugins)

  for (const pluginRef of pluginRefs) {
    debug(getLine(), 'init', 'Installing plugin: ' + pluginRef)
    let moduleRef = plugins[pluginRef]
    debug(getLine(), 'init', 'Installing from:', moduleRef)
    try {
      pluginCache[pluginRef] = await installModule(moduleRef)
      if (!pluginCache[pluginRef]) {
        debug(getLine(), 'init', 'Breaking. Caught error while installing module:', pluginRef)
        return false
      }
    } catch (e) {
      debug(getLine(), 'init', 'Breaking. Caught error while installing module:', e)
      return false
    }
  }
  debug(getLine(), 'init', 'Plugins loaded: ' + Object.keys(pluginCache).length)
  debug(getLine(), 'init', 'Configuring resources')
  let resources = getResources()
  Object.keys(resources).forEach(function (resourceName) {
    let resourceConfig = resources[resourceName]
    var resourceCredentials = ((typeof resourceConfig.credentials !== 'undefined') && (bootstrap.get('/credentials/' + resourceConfig.credentials) !== null)) ? bootstrap.get('/credentials/' + resourceConfig.credentials) : {}
    var resourceOptions = (typeof resourceConfig.options !== 'undefined') ? resourceConfig.options : {}
    resourceCache[resourceName] = require(pluginCache[resourceConfig.plugin])
    if (typeof resourceCache[resourceName].configurable !== 'undefined' && typeof resourceCache[resourceName].configurable === 'function') {
      resourceCache[resourceName].configurable({
        credentials: resourceCredentials,
        options: resourceOptions
      })
    }
  })
  debug(getLine(), 'init', 'Resources loaded:', Object.keys(resourceCache).length)
  debug(getLine(), 'init', 'Loading hooks')
  let hooks = getHooks()
  debug(getLine(), 'init', 'Loading hooks:', Object.keys(hooks))
  Object.keys(hooks).forEach(function (hook) {
    debug(getLine(), 'init', 'Plugging hook:', hook)
    let hookConfig = hooks[hook]
    let hookPath = '/' + hook + '/'
    debug(getLine(), 'init', 'Trying hook', hookPath, 'with', hookConfig)
    try {
      hookConfig.forEach(function (hookElement) {
        debug(getLine(), 'init', 'Plugging', hookElement, 'for hook', hook)
        let hookResult = router.use(hookPath, resourceCache[hookElement])
        if (!hookResult) throw new Error('Error plugging ' + hookElement + ' for hook ' + hook)
        debug(getLine(), 'init', 'Hook', hook, 'loaded hookElement:', hookElement)
      })
    } catch (installHookError) {
      throw new Error('Failed to install hook ' + hook)
    }
    debug(getLine(), 'init', 'Hooks loaded')
  })

  return true
}

// eslint-disable-next-line no-unused-vars
function getCredentials () {
  return bootstrap.get('/credentials')
}

function getHooks () {
  return bootstrap.get('/hooks')
}

function getPlugins () {
  return bootstrap.get('/plugins')
}

function getResources () {
  return bootstrap.get('/resources')
}

async function installBootstrap () {
  let bootstrapModulePath = process.env.HOOKHUB_BOOTSTRAP_MODULE
  debug(getLine(), 'installBootstrap')
  if (!isInstalled.sync(process.env.HOOKHUB_BOOTSTRAP_MODULE)) {
    if (typeof process.env.HOOKHUB_BOOTSTRAP_SOURCE !== 'undefined') {
      debug(getLine(), 'installBootstrap', 'Installing module from source:', process.env.HOOKHUB_BOOTSTRAP_SOURCE)
      bootstrapModulePath = await installModule(process.env.HOOKHUB_BOOTSTRAP_SOURCE)
    } else {
      debug(getLine(), 'installBootstrap', 'Installing module from npm:', process.env.HOOKHUB_BOOTSTRAP_MODULE)
      bootstrapModulePath = await installModule(process.env.HOOKHUB_BOOTSTRAP_MODULE)
    }
  }
  if (!bootstrap) {
    await new Promise(function (resolve, reject) {
      debug(getLine(), 'installBootstrap', 'Initializing bootstrap from', bootstrapModulePath)
      try {
        bootstrap = require(bootstrapModulePath)
        debug(getLine(), 'installBootstrap', 'Bootstrap loaded')
        resolve()
      } catch (e) {
        reject(new Error(getLine() + ': ' + e))
      }
    }).catch(function (err) {
      throw new Error(err)
    })
  }
}

var npmLoaded = false

async function installModule (moduleSrc) {
  debug(getLine(), 'installModule', moduleSrc)

  if (!npmLoaded) {
    await new Promise(function (resolve, reject) {
      debug(getLine(), 'installModule', moduleSrc, 'npm.load')
      npm.load(function (loadErr) {
        if (loadErr) return reject(new Error(getLine() + ': ' + loadErr))

        npmLoaded = true

        debug(getLine(), 'installModule', moduleSrc, 'npm.config.set')
        npm.config.set('progress', false)

        return resolve()
      })
    })
  }

  // install module moduleSrc
  let modulePath = await new Promise(function (resolve, reject) {
    npm.commands.install([moduleSrc], function (installErr, installResult) {
      // Check for error
      if (installErr) {
        debug(getLine(), 'installModule', moduleSrc, 'installErr:')
        debug(getLine(), 'installModule', moduleSrc, typeof installErr)
        debug(getLine(), 'installModule', moduleSrc, JSON.stringify(installErr))
        debug(getLine(), 'installModule', moduleSrc, typeof installErr.stderr !== 'undefined' ? installErr.stderr : installErr)
        return reject(new Error(getLine() + ': Failed to install ' + moduleSrc))
      }
      // We don't have an error
      debug(getLine(), 'installModule', moduleSrc, installResult)
      // Sanity check for correct result
      let installTarget = installResult.pop()
      if (installResult.length < 0 || installTarget.length !== 2 || !fs.existsSync(installTarget[1])) {
        debug(getLine(), 'installModule', moduleSrc, installResult.length < 0, installTarget.length !== 2, !fs.existsSync(installTarget[1]))
        return reject(new Error(getLine() + ': Failed to install ' + moduleSrc))
      }

      // We should be good to go. Return the path
      debug(getLine(), 'installModule', 'Returning modulePath', installTarget[1])
      return resolve(installTarget[1])
    })
  }).catch(function (err) {
    debug(getLine(), 'installModule', 'Caught error', err)
    return false
  })
  debug(getLine(), 'installModule', 'Returning modulePath', modulePath)
  return modulePath
}

module.exports.init = init
module.exports.hooks = router
module.exports.getHooks = getHooks
