(function() {
  var EventEmitter, ObjectExtender, _callQueue, _toCall, cson, fs, k, path, raf, v;

  EventEmitter = TOS.EventEmitter, fs = TOS.fs, path = TOS.path, cson = TOS.cson;

  raf = require('raf');

  _toCall = [];

  raf(_callQueue = function() {
    var c, cb, i, len;
    if (_toCall.length) {
      c = _.clone(_toCall);
      _toCall.length = 0;
      for (i = 0, len = c.length; i < len; i++) {
        cb = c[i];
        cb();
      }
    }
    return raf(_callQueue);
  });

  Object.constructor.prototype.load = function(path, cb) {
    return TOS.load(path, cb);
  };

  Object.constructor.prototype.loadSync = function(path) {
    return TOS.loadSync(path);
  };

  ObjectExtender = {
    async: function(cb, time) {
      if (time > 0) {
        return setTimeout(cb.bind(this), time);
      } else {
        return _toCall.push(cb.bind(this));
      }
    },
    deffered: function(cb) {
      return this.async(cb, 0);
    },
    val: function(path, value) {
      if (value != null) {
        return _.set(this, path, value);
      } else {
        return _.get(this, path);
      }
    },
    nest: function(path, value) {
      return this.mixin(require('nest-object').nest(path, value));
    },
    flatten: function() {
      return require('flat').flatten(this, {
        overwrite: true
      });
    },
    unflatten: function() {
      return require('flat').unflatten(this, {
        overwrite: true
      });
    },
    save: function(path, cb) {
      return TOS.save(this, path, cb);
    },
    saveSync: function(path) {
      return TOS.saveSync(this, path);
    },
    mixin: function(deep) {
      if (deep) {
        return _.deepExtend(this);
      } else {
        return _.extend(this);
      }
    },
    compact: TOS.instanceFunction(_.compactObject),
    renameKeys: TOS.instanceFunction(_.renameKeys),
    kv: TOS.instanceFunction(_.kv),
    isEmpty: TOS.instanceFunction(_.isEmpty),
    isError: TOS.instanceFunction(_.isError),
    isNull: TOS.instanceFunction(_.isNull),
    isUndefined: TOS.instanceFunction(_.isUndefined),
    isPlainObject: TOS.instanceFunction(_.isPlainObject),
    defaults: TOS.instanceFunction(_.defaultsDeep),
    pairs: TOS.instanceFunction(_.pairs),
    functions: TOS.instanceFunction(_.functions)
  };

  for (k in ObjectExtender) {
    v = ObjectExtender[k];
    Object.defineProperty(Object.prototype, k, {
      writable: true,
      configurable: true,
      enumerable: false,
      value: v
    });
  }

}).call(this);
