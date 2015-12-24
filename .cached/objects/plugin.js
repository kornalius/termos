(function() {
  var ExcludedClassProperties, ExcludedPrototypeProperties, Plugin, name,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  module.exports = Plugin = (function() {
    function Plugin() {}

    Plugin.install = function(constructor) {
      var i, key, len, name, pp, proto, ref, results1, v;
      proto = constructor.prototype;
      name = this.prototype.constructor.name;
      if (proto.$plugins == null) {
        proto.$plugins = [];
      }
      if (proto.$done == null) {
        proto.$done = {};
      }
      if (proto.$callBehaviors == null) {
        proto.$callBehaviors = function() {
          var args, fn, i, j, key, len, len1, p, pi, ref, ref1, results;
          key = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          results = [];
          ref = this.$plugins;
          for (i = 0, len = ref.length; i < len; i++) {
            pi = ref[i];
            p = pi.data;
            if (p.behaviors[key] != null) {
              ref1 = p.behaviors[key];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                fn = ref1[j];
                results.push(fn.apply(this, args));
              }
            }
          }
          if (results.length === 1) {
            results = results[0];
          }
          return results;
        };
      }
      if (proto.$getObjects == null) {
        proto.$getObjects = function(key) {
          var d, i, j, len, len1, p, pi, ref, ref1, results;
          results = {};
          ref = this.$plugins;
          for (i = 0, len = ref.length; i < len; i++) {
            pi = ref[i];
            p = pi.data;
            if (p.objects[key] != null) {
              ref1 = p.objects[key];
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                d = ref1[j];
                _.deepExtend(results, d);
              }
            }
          }
          return results;
        };
      }
      if (!_.find(proto.$plugins, 'name', name)) {
        pp = {
          behaviors: {},
          objects: {}
        };
        proto.$plugins.push({
          name: name,
          data: pp
        });
        ref = Object.getOwnPropertyNames(this.prototype);
        results1 = [];
        for (i = 0, len = ref.length; i < len; i++) {
          key = ref[i];
          if (!(indexOf.call(ExcludedPrototypeProperties, key) < 0)) {
            continue;
          }
          v = this.prototype[key];
          if (_.isFunction(v)) {
            if (pp.behaviors[key] == null) {
              pp.behaviors[key] = [];
            }
            if (proto.$done[key] == null) {
              if (proto.hasOwnProperty(key)) {
                pp.behaviors[key].push(proto[key]);
              }
              proto[key] = new Function("return this.$callBehaviors(['" + key + "'].concat(Array.from(arguments)));");
              proto.$done[key] = true;
            }
            results1.push(pp.behaviors[key].unshift(v));
          } else {
            if (pp.objects[key] == null) {
              pp.objects[key] = [];
            }
            if (proto.$done[key] == null) {
              if (proto.hasOwnProperty(key)) {
                pp.objects[key].push(proto[key]);
              }
              proto.$done[key] = true;
            }
            results1.push(pp.objects[key].push(v));
          }
        }
        return results1;
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
