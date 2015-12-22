(function() {
  var DBFS, Promise, VFS, _id, app, mime, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  app = TOS.app, path = TOS.path, VFS = TOS.VFS, Promise = TOS.Promise;

  mime = require('mime');

  _id = function(path) {
    return _.trimRight(path.toLowerCase(), '/');
  };

  TOS.DBFS = DBFS = (function(superClass) {
    extend(DBFS, superClass);

    function DBFS() {
      return DBFS.__super__.constructor.apply(this, arguments);
    }

    DBFS.prototype.clear = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("DROP INDEXEDDB DATABASE IF EXISTS termos;\nCREATE INDEXEDDB DATABASE IF NOT EXISTS termos;\nATTACH INDEXEDDB DATABASE termos;\nUSE termos;\nCREATE TABLE IF NOT EXISTS fs (path_name STRING PRIMARY KEY, data STRING, size NUMBER, ctime NUMBER, mtime NUMBER)", [], function(res, err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.use = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var that;
          that = _this;
          return _this.ready().then(function() {
            return resolve(true);
          })["catch"](function() {
            return that.clear().then(function() {
              return resolve(true);
            })["catch"](function(err) {
              return reject(err);
            });
          });
        };
      })(this));
    };

    DBFS.prototype.ready = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("ATTACH INDEXEDDB DATABASE termos", [], function(res, err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.exists = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT path_name FROM fs WHERE path_name == '" + (_id(path)) + "'", [], function(res, err) {
            if (!err) {
              return resolve((res != null ? res.length : void 0) > 0);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.read = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT data FROM fs WHERE path_name == '" + (_id(path)) + "'", [], function(res, err) {
            if (!err) {
              return resolve(res.length >= 3 ? res[2][0].data : null);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.write = function(path, data) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var l, p, t;
          p = _id(path);
          t = Date.now();
          l = data.length;
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos;\nIF (SELECT path_name FROM fs WHERE path_name == '" + p + "')\n  UPDATE fs SET data = '" + data + "', size = " + l + ", mtime = " + t + " WHERE path_name == '" + p + "'\nELSE\n  INSERT INTO fs VALUES { path_name: '" + p + "', data: '" + data + "', size: " + l + ", ctime: " + t + ", mtime: " + t + " }", [], function(res, err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.stats = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT size, ctime, mtime FROM fs WHERE path_name == '" + (_id(path)) + "'", [], function(res, err) {
            if (!err) {
              return resolve(res.length >= 3 ? res[2][0] : null);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.del = function(path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; DELETE FROM fs WHERE path_name == '" + (_id(path)) + "'", [], function(res, err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.rename = function(path, new_path) {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var p, t;
          p = _id(path);
          t = Date.now();
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; UPDATE fs path_name = '" + (_id(new_path)) + "', mtime = " + t + " WHERE path_name == '" + p + "'", [], function(res, err) {
            if (!err) {
              return resolve(true);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    DBFS.prototype.files = function(path, deep) {
      if (deep == null) {
        deep = false;
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          var p;
          p = _id(path);
          return alasql("ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT path_name FROM fs WHERE path_name LIKE '" + p + "%'", [], function(res, err) {
            if (!err) {
              return resolve(res.length >= 3 ? _.map(res[2], function(v) {
                return v.path_name;
              }) : null);
            } else {
              return reject(err);
            }
          });
        };
      })(this));
    };

    return DBFS;

  })(VFS);

  window.dbfs = new DBFS();

}).call(this);
