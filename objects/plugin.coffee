
module.exports = class Plugin


  @install: (constructor) ->
    proto = constructor.prototype
    name = @prototype.constructor.name

    if !proto.__plugins?
      proto.__plugins = []

    if !_.find(proto.__plugins, 'name', name)
      pp =
        extended: []
        behaviors: {}
        objects: {}
      proto.__plugins.push { name:name, data: pp }

      if !proto.__$callBehaviors__?
        proto.__$callBehaviors__ = (key, args...) ->
          results = []
          for pi in @__plugins
            p = pi.data
            if p.behaviors[key]?
              for fn in p.behaviors[key]
                results.push(fn.apply(@, args))
          return results

      if !proto.__$getObjects__?
        proto.__$getObjects__ = (key) ->
          results = {}
          for pi in @__plugins
            p = pi.data
            if p.objects[key]?
              for d in p.objects[key]
                _.deepExtend results, d
          return results

      # for key, value of @ when key not in ExcludedClassProperties
        # constructor[key] = value unless constructor.hasOwnProperty(key)

      op = @prototype
      for key in Object.getOwnPropertyNames(op) when key not in ExcludedPrototypeProperties

        # opd = Object.getOwnPropertyDescriptor(op, key)
        # if opd?.get or opd?.set
          # continue

        value = op[key]
        k = "__$#{key}__"

        if _.isFunction(value) and _.isFunction(proto[key])
          if !pp.behaviors[key]?
            pp.behaviors[key] = []
          if !proto[k]?
            pp.behaviors[key].push proto[key]
            proto[key] = new Function "return this.__$callBehaviors__.apply(this, ['#{key}'].concat(Array.from(arguments)));"
            proto[k] = true
          pp.behaviors[key].unshift value
          pp.extended.push key

        else if _.isPlainObject(value)
          if !pp.objects[key]?
            pp.objects[key] = []
          if !proto[k]?
            if proto.hasOwnProperty(key)
              debugger;
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
    _.remove(proto.__plugins_order, name)


ExcludedClassProperties = ['__super__']
ExcludedClassProperties.push(name) for name of Plugin

ExcludedPrototypeProperties = ['constructor']
