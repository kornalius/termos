startTime = Date.now()
console.log "Starting up new context..."

remote = require('remote')
app = remote.require('app')
p = remote.require('path')
ipc = require('ipc')
fs = remote.require('fs-plus')

# mixins = require('coffeescript-mixins')
# mixins.bootstrap()


# userPath = p.join(app.getPath('home'), '.termos')
userPath = p.join(p.dirname(module.filename), '../user')

if !fs.existsSync(userPath)
  fs.mkdirSync(userPath)


window._ = require('underscore-plus')
_.extend _, require('lodash')


window.TOS =
  remote: remote
  app: app
  BrowserWindow: remote.require('browser-window')
  appWindow: remote.getCurrentWindow()
  dirs:
    home: app.getPath('home')
    app: app.getPath('appData')
    user: userPath
    tmp: app.getPath('temp')
    root: app.getPath('exe')
    module: p.dirname(module.filename)
    node_modules: p.join(userPath, 'node_modules')
    user_pkg: p.join(userPath, 'package.json')
  path: p
  fs: fs
  ipc: ipc
  buffer: remote.require 'buffer'
  http: remote.require 'http'
  url: remote.require 'url'
  util: remote.require 'util'
  uuid: remote.require 'uuid'

  IS_WIN: /^win/.test process.platform
  IS_OSX: process.platform == 'darwin'
  IS_LINUX: process.platform == 'linux'

_.extend TOS,
  PropertyAccessors: require 'property-accessors'
  EventEmitter: require 'eventemitter3'
  # Terminal: require('./terminal/terminal')
  cson: require('cson-parser')
  Promise: require('bluebird')

_.extend TOS,
  require('./webcomponent'),
  require('./packages'),
  require('./settings')


require('../objects/index')
require('../components/index')


console.log "Finished startup!", "#{Date.now() - startTime}ms"


ipc.on 'load', (run) ->

  # TOS.loadCSS(p.join(__dirname, '/terminal/colors.css'))
  # TOS.loadCSS(p.join(__dirname, '/terminal/fonts.css'))
  # TOS.loadCSS(p.join(__dirname, '/terminal/terminal.css'))
  # TOS.loadCSS(p.join(__dirname, '/terminal/terminal-line.css'))
  # TOS.loadCSS(p.join(__dirname, '/terminal/terminal-cursor.css'))

  # require('./init')
  require(p.join(TOS.dirs.user, 'init'))

  if run?
    require(run)


ipc.on 'unload', ->

  require(p.join(TOS.dirs.user, 'shut'))
  # require('./shut')


