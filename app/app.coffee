{ app } = TOS

console.log "Booting #{app.getName()} v#{app.getVersion()}..."
console.log "io.js: #{process.version}"
console.log "Electron: #{process.versions['electron']}"
console.log "CoffeeScript: #{require('coffee-script').VERSION}"
console.log "ALASQL: #{alasql.version}"
console.log ""
console.log "Root path: #{TOS.dirs.root}"
console.log "Module path: #{TOS.dirs.node_modules}"
console.log "Temp path: #{TOS.dirs.tmp}"
console.log "App path: #{TOS.dirs.app}"
console.log "User path: #{TOS.dirs.user}"
console.log "Home path: #{TOS.dirs.home}"

TOS.ipc.send('createWindow', { title: 'Tests', run: '../tests/index', devTools: true })

TOS.ipc.send('createWindow', { title: 'Terminal', run: '../tests/terminal', devTools: true, maximize: true })
