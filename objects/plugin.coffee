
module.exports = class Plugin


  @install: (constructor) ->
    proto = constructor.prototype
    name = @prototype.constructor.name

    if !proto.__plugins?
      proto.__plugins = {}

    if !proto.__plugins[name]?
      pp =
        extended: []
        behaviors: {}
        objects: {}
      proto.__plugins[name] = pp

      if !proto.__$callBehaviors__?
        proto.__$callBehaviors__ = (key, args...) ->
          results = []
          for k, p of @__plugins
            if p.behaviors[key]?
              for fn in p.behaviors[key]
                results.push(fn.apply(@, args))
          return results

      if !proto.__$getObjects__?
        proto.__$getObjects__ = (key) ->
          results = {}
          for k, p of @__plugins
            if p.objects[key]?
              for d in p.objects[key]
                _.deepExtend results, d
          return results

      # for key, value of @ when key not in ExcludedClassProperties
        # constructor[key] = value unless constructor.hasOwnProperty(key)

      op = @prototype
      for key in Object.getOwnPropertyNames(op) when key not in ExcludedPrototypeProperties
        value = op[key]
        k = "__$#{key}__"

        if _.isFunction(value) and _.isFunction(proto[key])
          if !pp.behaviors[key]?
            pp.behaviors[key] = []
          if !proto[k]?
            if proto[key]?
              pp.behaviors[key].push proto[key]
            proto[key] = new Function "return this.__$callBehaviors__.apply(this, ['#{key}'].concat(Array.from(arguments)));"
            proto[k] = true
          pp.behaviors[key].unshift value
          pp.extended.push key

        else if _.isPlainObject(value)
          if !pp.objects[key]?
            pp.objects[key] = []
          if !proto[k]?
            if proto[key]?
              pp.objects[key].push proto[key]
            Object.defineProperty(proto, key, get: new Function "return this.__$getObjects__.apply(this, ['#{key}']);")
            proto[k] = true
          pp.objects[key].push value
          pp.extended.push key

        else if !Object.hasOwnProperty(proto, key)
          proto[key] = value
          pp.extended.push key


  @uninstall: (constructor) ->
    proto = constructor.prototype
    name = @prototype.constructor.name
    if proto.__plugins?
      delete proto.__plugins[name]


ExcludedClassProperties = ['__super__']
ExcludedClassProperties.push(name) for name of Plugin

ExcludedPrototypeProperties = ['constructor']
