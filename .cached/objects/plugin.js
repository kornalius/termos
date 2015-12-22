(function() {
  var ExcludedClassProperties, ExcludedPrototypeProperties, Plugin, name,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = Plugin = (function() {
    function Plugin() {}

    Plugin.install = function(constructor) {
      var i, k, key, len, name, op, pp, proto, ref, results1, value;
      proto = constructor.prototype;
      name = this.prototype.constructor.name;
      if (proto.__plugins == null) {
        proto.__plugins = {};
      }
      if (proto.__plugins[name] == null) {
        pp = {
          extended: [],
          behaviors: {},
          objects: {}
        };
        proto.__plugins[name] = pp;
        if (proto.__$callBehaviors__ == null) {
          proto.__$callBehaviors__ = function() {
            var args, fn, i, k, key, len, p, ref, ref1, results;
            key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
            results = [];
            ref = this.__plugins;
            for (k in ref) {
              p = ref[k];
              if (p.behaviors[key] != null) {
                ref1 = p.behaviors[key];
                for (i = 0, len = ref1.length; i < len; i++) {
                  fn = ref1[i];
                  results.push(fn.apply(this, args));
                }
              }
            }
            return results;
          };
        }
        if (proto.__$getObjects__ == null) {
          proto.__$getObjects__ = function(key) {
            var d, i, k, len, p, ref, ref1, results;
            results = {};
            ref = this.__plugins;
            for (k in ref) {
              p = ref[k];
              if (p.objects[key] != null) {
                ref1 = p.objects[key];
                for (i = 0, len = ref1.length; i < len; i++) {
                  d = ref1[i];
                  _.deepExtend(results, d);
                }
              }
            }
            return results;
          };
        }
        op = this.prototype;
        ref = Object.getOwnPropertyNames(op);
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          if (!(indexOf.call(ExcludedPrototypeProperties, key) < 0)) {
            continue;
          }
          value = op[key];
          k = "__$" + key + "__";
          if (_.isFunction(value) && _.isFunction(proto[key])) {
            if (pp.behaviors[key] == null) {
              pp.behaviors[key] = [];
            }
            if (proto[k] == null) {
              if (proto[key] != null) {
                pp.behaviors[key].push(proto[key]);
              }
              proto[key] = new Function("return this.__$callBehaviors__.apply(this, ['" + key + "'].concat(Array.from(arguments)));");
              proto[k] = true;
            }
            pp.behaviors[key].unshift(value);
            results1.push(pp.extended.push(key));
          } else if (_.isPlainObject(value)) {
            if (pp.objects[key] == null) {
              pp.objects[key] = [];
            }
            if (proto[k] == null) {
              if (proto[key] != null) {
                pp.objects[key].push(proto[key]);
              }
              Object.defineProperty(proto, key, {
                get: new Function("return this.__$getObjects__.apply(this, ['" + key + "']);")
              });
              proto[k] = true;
            }
            pp.objects[key].push(value);
            results1.push(pp.extended.push(key));
          } else if (!Object.hasOwnProperty(proto, key)) {
            proto[key] = value;
            results1.push(pp.extended.push(key));
          } else {
            results1.push(void 0);
          }
        }
        return results1;
      }
    };

    Plugin.uninstall = function(constructor) {
      var name, proto;
      proto = constructor.prototype;
      name = this.prototype.constructor.name;
      if (proto.__plugins != null) {
        return delete proto.__plugins[name];
      }
    };

    return Plugin;

  })();

  ExcludedClassProperties = ['__super__'];

  for (name in Plugin) {
    ExcludedClassProperties.push(name);
  }

  ExcludedPrototypeProperties = ['constructor'];

}).call(this);
