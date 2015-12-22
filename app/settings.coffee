{ fs, path, cson, dirs, PropertyAccessors } = TOS


settingPath = (filename, cb) ->
  p = path.join(dirs.user, filename)
  fs.stat p, (err, stats) ->
    if !err?
      cb(err, p)
    else
      p = path.join(dirs.module, filename)
      fs.stat p, (err, stats) ->
        cb(err, if !err? then p else null)


loadSetting = (filename, cb) ->
  settingPath filename, (err, p) ->
    if !err?
      Object.load p, (err, data) ->
        cb(err, p, data)


saveSetting = (data, filename, cb) -> data.save path.join(dirs.user, filename), cb


Settings = class Settings
  PropertyAccessors.includeInto(@)


  constructor: (@filename = 'settings', @mode = 'cson') ->
    @system = {}
    @user = {}
    @load()


  @::accessor 'sysPath', ->
    if @isLocalStorage then "#{@filename}_system" else path.join dirs.module, "#{@filename}.#{@ext}"


  @::accessor 'userPath', ->
    if @isLocalStorage then "#{@filename}_user" else path.join dirs.user, "#{@filename}.#{@ext}"


  @::accessor 'ext', -> @mode


  @::accessor 'serializer', ->
    if @isCSON
      return cson
    else
      return JSON


  @::accessor 'isCSON', -> @mode == 'cson'


  @::accessor 'isJSON', -> @mode == 'json'


  @::accessor 'isLocalStorage', -> @mode == 'local'


  load: (cb) ->
    console.log "Loading settings..."

    if @isLocalStorage

      console.log "  system #{@sysPath}..."
      data = localStorage.getItem(@sysPath)
      if data.length
        @system = @serializer.parse(data)
      else
        @system = {}

      console.log "  user #{@userPath}..."
      data = localStorage.getItem(@userPath)
      if data.length
        @user = @serializer.parse(data)
      else
        @user = {}

      cb(err) if cb?

    else

      console.log "  system #{@sysPath}..."
      fs.readFile @sysPath, (err, data) ->
        if !err?
          if data.length
            @system = @serializer.parse(data)
          else
            @system = {}

          console.log "  user #{@userPath}..."
          fs.readFile @userPath, (err, data) ->
            if !err?
              if data.length
                @user = @serializer.parse(data)
              else
                @user = {}
            # else
              # throw err
            cb(err) if cb?
        else
          # throw err
          cb(err) if cb?


  save: (cb) ->
    console.log "Saving user settings #{@userPath}..."
    data = @serializer.stringify(@user, null, 2)
    if @isLocalStorage
      localStorage.setItem(@userPath, data)
      cb(err) if cb?
    else
      fs.writeFile @userPath, data, (err) ->
        cb(err) if cb?


  saveSync: ->
    console.log "Saving user settings #{@userPath}..."
    data = @serializer.stringify(@user, null, 2)
    if @isLocalStorage
      localStorage.setItem(@userPath, data)
    else
      fs.writeFileSync @userPath, data


  set: (key, value, autosave = false) ->
    _.setValueForKeyPath @user, key, value
    @save() if autosave


  get: (key, defaultValue = null) ->
    v = _.valueForKeyPath _.extend({}, @system, @user), key
    if v? then v else defaultValue


  push: (key, value, autosave = false) ->
    v = @get key
    if _.isArray(v)
      v.push(value)
    @set key, v, autosave


  pop: (key, autosave = false) ->
    v = @get key
    if _.isArray(v)
      v.pop()
    @set key, v, autosave


  remove: (key, value, autosave = false) ->
    v = @get key
    if _.isArray(v)
      _.remove v, value
    @set key, v, autosave


  contains: (key, value) ->
    v = @get key
    if _.isArray(v) then _.contains v, value else false



module.exports =

  Settings: Settings

  settings: new Settings()

  settingPath: settingPath

  loadSetting: loadSetting

  saveSetting: saveSetting

