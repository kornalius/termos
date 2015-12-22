path = require('path')
_ = require('lodash')

ipc = require('ipc')
app = require('app')
BrowserWindow = require('browser-window')


app.windows = []


createWindow = (options) ->
  w = new BrowserWindow(_.defaults(options, {
    url: 'file://' + __dirname + '/index.html'
    center: true
    webPreferences:
      webSecurity: false
      textAreasAreResizable: false
      experimentalFeatures: true
      experimentalCanvasFeatures: true
      subpixelFontScaling: true
      allowDisplayingInsecureContent: true
      allowRunningInsecureContent: true
      sharedWorker: true
  }))

  app.windows.push(w)

  if options.maximize
    w.maximize()
  if options.url?
    w.loadUrl options.url
  if options.devTools?
    w.openDevTools()

  w.on 'close', ->
    w.webContents.send('unload')
    return true

  w.on 'closed', ->
    _.remove(app.windows, w)

  w.webContents.on 'did-finish-load', ->
    w.webContents.send('load', options.run)

  return w


# require('crash-reporter').start()


app.commandLine.appendSwitch 'enable-precise-memory-info'


app.on 'window-all-closed', (e) ->
  if process.platform != 'darwin'
    app.quit()


app.on 'before-quit', (e) ->
  console.log 'before-quit'


app.on 'will-quit', (e) ->
  console.log 'will-quit'


app.on 'quit', (e) ->
  console.log 'quit'


app.on 'will-finish-launching', (e) ->
  console.log 'will-finish-launching'


app.on 'browser-window-blur', (e) ->
  console.log 'browser-window-blur'


app.on 'browser-window-focus', (e) ->
  console.log 'browser-window-focus'


app.on 'browser-window-created', (e) ->
  console.log 'browser-window-created'


app.on 'gpu-process-crashed', (e) ->
  console.log 'gpu-process-crashed'


app.on 'ready', (e) ->

  mainWindow = createWindow(
    title: 'termOS'
    center: true
    devTools: true
    run: '../app/app'
  )


ipc.on 'createWindow', (e, options) ->
  createWindow(options)
  # e.returnValue = createWindow(options)
