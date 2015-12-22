(function() {
  var cson, fs, path,
    slice = [].slice;

  fs = TOS.fs, path = TOS.path, cson = TOS.cson;

  require('sugar');

  TOS.CustomEvent = function(detail) {
    return new CustomEvent('', {
      detail: detail
    });
  };

  TOS.instanceFunction = function(fn) {
    return function() {
      return fn.call.apply(fn, [null, this].concat(slice.call(arguments)));
    };
  };

  TOS.instanceFunctions = function(target, source, names) {
    var i, len, n, results;
    results = [];
    for (i = 0, len = names.length; i < len; i++) {
      n = names[i];
      if (target.prototype[n] == null) {
        results.push(target.prototype[n] = TOS.instanceFunction(source[n]));
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  TOS.Plugin = require('./plugin');

  require('./object');

  require('./element');

  require('./number');

  require('./boolean');

  require('./string');

  require('./array');

  require('./tree');

  require('./date');

  require('./color');

  require('./flags');

  require('./vfs');

  require('./lfs');

  require('./dbfs');

  require('./file');

  TOS.save = function(obj, path, cb) {
    return fs.writeFile(path, cson.stringify(obj, null, 2), function(err) {
      if (err != null) {
        throw err;
      }
      if (cb != null) {
        return cb(err);
      }
    });
  };

  TOS.saveSync = function(obj, path) {
    return fs.writeFileSync(path, cson.stringify(obj, null, 2));
  };

  TOS.load = function(path, cb) {
    return fs.readFile(path, function(err, data) {
      if (err != null) {
        throw err;
      }
      if (cb != null) {
        return cb(err, cson.parse(data));
      }
    });
  };

  TOS.loadSync = function(path) {
    return cson.parse(fs.readFileSync(path));
  };

}).call(this);
