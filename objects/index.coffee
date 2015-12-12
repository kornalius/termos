{ fs, path, cson } = TOS

require('sugar')

TOS.CustomEvent = (detail) -> new CustomEvent '', detail: detail

# TOS.parseFunction = (fn) ->
#   if _.isFunction(fn)
#     fn = fn.toString()

#   match = /^function\s*([\w$]*)\s*\(([\w\s,$]*)\)\s*\{([\w\W\s\S]*)\}$/.exec(fn)

#   _parameters = match?[2] or ''
#   _arguments = match?[2].length and match?[2].replace(/\s/g, '').split(',') or []

#   return {
#     name: match?[1] or 'anonymous'
#     params: _parameters
#     args: _arguments
#     body: match?[3] or ''
#   }

TOS.instanceFunction = (fn) ->
  # r = TOS.parseFunction(fn)
  # v = _.first(r.args)
  # args = r.args[1..]
  # body = "#{if v then "\tvar #{v} = this;\n"} #{r.body}"
  # return new Function(args..., body)
  -> fn.call(null, @, arguments...)

TOS.instanceFunctions = (target, source, names) ->
  for n in names
    if !target.prototype[n]?
      # target.prototype[n] = new Function(TOS.instanceFunction(source[n]))
      target.prototype[n] = TOS.instanceFunction(source[n])


require('./object.coffee')
require('./element.coffee')
require('./number.coffee')
require('./boolean.coffee')
require('./string.coffee')
require('./array.coffee')
require('./tree.coffee')
require('./date.coffee')
require('./color.coffee')
require('./flags.coffee')
require('./vfs.coffee')
require('./lfs.coffee')
require('./dbfs.coffee')
require('./file.coffee')


TOS.save = (obj, path, cb) ->
  fs.writeFile path, cson.stringify(obj, null, 2), (err) ->
    throw err if err?
    cb(err) if cb?

TOS.load = (path, cb) ->
  fs.readFile path, (err, data) ->
    throw err if err?
    cb(err, cson.parse(data)) if cb?

TOS.saveSync = (obj, path) -> fs.writeFileSync path, cson.stringify(obj, null, 2)

TOS.loadSync = (path) -> cson.parse(fs.readFileSync path)

