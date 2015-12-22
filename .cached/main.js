(function() {
  var BrowserWindow, _, app, createWindow, ipc, path;

  path = require('path');

  _ = require('lodash');

  ipc = require('ipc');

  app = require('app');

  BrowserWindow = require('browser-window');

  app.windows = [];

  createWindow = function(options) {
    var w;
    w = new BrowserWindow(_.defaults(options, {
      url: 'file://' + __dirname + '/index.html',
      center: true,
      webPreferences: {
        webSecurity: false,
        textAreasAreResizable: false,
        experimentalFeatures: true,
        experimentalCanvasFeatures: true,
        subpixelFontScaling: true,
        allowDisplayingInsecureContent: true,
        allowRunningInsecureContent: true,
        sharedWorker: true
      }
    }));
    app.windows.push(w);
    if (options.maximize) {
      w.maximize();
    }
    if (options.url != null) {
      w.loadUrl(options.url);
    }
    if (options.devTools != null) {
      w.openDevTools();
    }
    w.on('close', function() {
      w.webContents.send('unload');
      return true;
    });
    w.on('closed', function() {
      return _.remove(app.windows, w);
    });
    w.webContents.on('did-finish-load', function() {
      return w.webContents.send('load', options.run);
    });
    return w;
  };

  app.commandLine.appendSwitch('enable-precise-memory-info');

  app.on('window-all-closed', function(e) {
    if (process.platform !== 'darwin') {
      return app.quit();
    }
  });

  app.on('before-quit', function(e) {
    return console.log('before-quit');
  });

  app.on('will-quit', function(e) {
    return console.log('will-quit');
  });

  app.on('quit', function(e) {
    return console.log('quit');
  });

  app.on('will-finish-launching', function(e) {
    return console.log('will-finish-launching');
  });

  app.on('browser-window-blur', function(e) {
    return console.log('browser-window-blur');
  });

  app.on('browser-window-focus', function(e) {
    return console.log('browser-window-focus');
  });

  app.on('browser-window-created', function(e) {
    return console.log('browser-window-created');
  });

  app.on('gpu-process-crashed', function(e) {
    return console.log('gpu-process-crashed');
  });

  app.on('ready', function(e) {
    var mainWindow;
    return mainWindow = createWindow({
      title: 'termOS',
      center: true,
      devTools: true,
      run: '../app/app'
    });
  });

  ipc.on('createWindow', function(e, options) {
    return createWindow(options);
  });

}).call(this);
