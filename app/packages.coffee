{ fs, path, dirs, npm, settings, PropertyAccessors } = TOS


_autoloaded = []


Package = class Package
  PropertyAccessors.includeInto(@)


  constructor: (@name, @version, @path) ->
    @_json = null


  @::accessor 'package', -> path.join @path, 'package.json'


  @::accessor 'json', ->
    return @_json if @_json?
    @_json = JSON.parse fs.readFileSync(@package)
    return @_json


  @::accessor 'main', -> path.join @path, @json.main


  @::accessor 'version', -> path.join @path, @json.version


  @::accessor 'author', -> path.join @path, @json.author


  @::accessor 'isInstalled', -> TOS.packages.isInstalled @name


  @::accessor 'isLoaded', -> TOS.packages.isLoaded @name


  install: (cb) -> TOS.packages.install [@name], cb


  uninstall: (cb) -> TOS.packages.uninstall [@name], cb


  load: (spaces) -> TOS.packages.load [@name], spaces


  unload: (spaces) -> TOS.packages.unload [@name], spaces


  publish: -> TOS.packages.publish @name



Packages = class Packages
  PropertyAccessors.includeInto(@)


  constructor: ->


  @::accessor 'deps', ->
    @init()
    pkg = JSON.parse fs.readFileSync(dirs.user_pkg)
    r = if pkg? and pkg.dependencies? then pkg.dependencies else {}
    nr = []
    for n, v of r
      pn = path.join dirs.user, v
      fn = path.join pn, n
      ex = fs.existsSync(fn)
      nr.push new module.exports.Package(n, (if ex then '0.0.0' else v), (if ex then pn else path.join dirs.node_modules, n))
    return nr


  autoload: (type) ->
    r = []
    al = settings.get('autoload')
    if !type?
      for k, v of al
        r.push k
    else if type == 'e'
      for k, v of al
        r.push k if v
    else if type == 'd'
      for k, v of al
        r.push k if !v
    return r


  find: (name) ->
    for p in @deps
      return p if p.name == name
    return null


  init: ->
    f = dirs.user_pkg
    if !fs.existsSync f
      fs.writeFileSync f, JSON.stringify(
        name: "my_termos_setup"
        private: true
        dependencies: {}
      , null, '  ')


  install: (names, cb) ->
    @init()
    if !names?
      names = []
    npm.load
      prefix: dirs.user
      save: true
    , ->
      npm.commands.install names, (err) ->
        if err?
          throw err
        else
          for n in names
            settings.push 'autoload', n
        cb(arguments) if cb?


  uninstall: (names, cb) ->
    @init()
    npm.load
      prefix: dirs.user
      save: true
    , ->
      npm.commands.uninstall names, (err) ->
        if err?
          throw err
        else
          for n in names
            @unload n
            settings.remove 'autoload', n
        cb(arguments) if cb?


  isInstalled: (name) -> @find(name)?


  isLoaded: (name) ->
    for p in TOS._autoloaded
      return p if p.name == name
    return null


  path: (name) ->
    p = @find(name)
    if p? then p.path else null


  package: (name) ->
    p = @path(name)
    if p? then path.join p, 'package.json' else null


  json: (name) ->
    p = @package(name)
    if p? then JSON.parse fs.readFileSync(p) else null


  main: (name) ->
    p = @path(name)
    j = @json(name)
    if p? and j? then path.join p, j.main else null


  version: (name) ->
    p = @path(name)
    j = @json(name)
    if p? and j? then path.join p, j.version else null


  author: (name) ->
    p = @path(name)
    j = @json(name)
    if p? and j? then path.join p, j.author else null


  load: (names, spaces) ->
    if names?
      if !spaces?
        spaces = ''
      for name in names
        if !@isLoaded name
          if @isInstalled name
            m = require(@main name)
            if m?
              console.log "#{spaces}#{name} loaded"
              TOS._autoloaded.push
                module: m
                name: name
              m.load()
          else
            console.log "#{spaces}#{name} ** not installed"
        else
          console.log "#{spaces}#{name} ** already loaded"

    else
      console.log "Loading plugins..."
      for n in @autoloads 'e'
        @load n, '  '

    # paths = fs.listSync path.join(dirs.module, 'plugins'), ['coffee', 'js']
    # if paths?
    #   for f in paths
    #     p = new Plugin f, ->
    #       console.log "  #{p.name}#{if p.ignored then ' -- ignored --' else ''}"


  unload: (names, spaces) ->
    if names?
      if !spaces?
        spaces = ''
      for name in names
        p = @isLoaded name
        if p?
          console.log "#{spaces}#{name} unloaded"
          p.module.unload()
          _.remove TOS._autoloaded, p
        else
          console.log "#{spaces}#{name} ** not loaded"

    else
      console.log "Unloading plugins..."
      for p in TOS._autoloaded
        @unload p.name, '  '


  publish: (name) ->


  create: (opts) ->
    name = "TOS-#{opts.name}"
    p = @path(name)
    fs.mkdirSync p
    opts.main = 'main.coffee' if !opts.main?
    opts.version = '0.0.1' if !opts.version?
    pkg = @package(name)
    if pkg?
      fs.writeFileSync pkg, JSON.stringify(opts, null, '  ')
      fs.writeFileSync @main(name), ''
      return new module.exports.Package(name, opts.version, p)
    return null



module.exports =

  Package: Package

  Packages: Packages

  packages: new Packages()
