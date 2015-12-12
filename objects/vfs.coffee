
TOS.VFS = class VFS


  read: (path) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  write: (path, data) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  exists: (path) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  stats: (path) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  size: (path, deep = false) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  files: (path, deep = false) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  del: (path) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  rename: (path, newName) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


  mkdir: (path) -> new Promise (resolve, reject) -> reject new Error('Not implemented!')


window.vfs = new VFS()
