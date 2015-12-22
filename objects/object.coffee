{ EventEmitter, fs, path, cson } = TOS

raf = require('raf')

_toCall = []

raf _callQueue = ->
  if _toCall.length
    c = _.clone(_toCall)
    _toCall.length = 0
    for cb in c
      cb()
  raf _callQueue


Object.constructor.prototype.load = (path, cb) -> TOS.load(path, cb)

Object.constructor.prototype.loadSync = (path) -> TOS.loadSync(path)


ObjectExtender =

  async: (cb, time) ->
    if time > 0
      setTimeout(cb.bind(@), time)
    else
      _toCall.push(cb.bind(@))

  deffered: (cb) -> @async(cb, 0)

  val: (path, value) -> if value? then _.set @, path, value else _.get @, path

  nest: (path, value) -> @mixin require('nest-object').nest(path, value)

  flatten: -> require('flat').flatten @, overwrite: true

  unflatten: -> require('flat').unflatten @, overwrite: true

  save: (path, cb) -> TOS.save(@, path, cb)

  saveSync: (path) -> TOS.saveSync(@, path)

  mixin: (deep) -> if deep then _.deepExtend @ else _.extend @

  compact: TOS.instanceFunction(_.compactObject)

  renameKeys: TOS.instanceFunction(_.renameKeys)

  kv: TOS.instanceFunction(_.kv)

  isEmpty: TOS.instanceFunction(_.isEmpty)

  isError: TOS.instanceFunction(_.isError)

  isNull: TOS.instanceFunction(_.isNull)

  isUndefined: TOS.instanceFunction(_.isUndefined)

  isPlainObject: TOS.instanceFunction(_.isPlainObject)

  defaults: TOS.instanceFunction(_.defaultsDeep)

  pairs: TOS.instanceFunction(_.pairs)

  functions: TOS.instanceFunction(_.functions)


for k, v of ObjectExtender
  Object.defineProperty Object.prototype, k, writable: true, configurable: true, enumerable: false, value: v
