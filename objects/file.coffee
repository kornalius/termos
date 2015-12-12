{ lfs } = TOS


TOS.File = class File


  constructor: (@path) ->


  isFile: -> lfs.isFile @path


  isFolder: -> lfs.isFile @path


  read: -> lfs.read @path


  write: (data) -> lfs.write @path, data


  exists: -> lfs.exists @path


  stats: -> lfs.stats @path


  size: (deep = false) -> lfs.size @path, deep


  files: (deep = false) -> lfs.files @path, deep


  del: -> lfs.del @path


  rename: (newName) -> lfs.rename @path, newName


  mkdir: -> lfs.mkdir @path

