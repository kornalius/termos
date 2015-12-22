(function() {
  var VFS;

  TOS.VFS = VFS = (function() {
    function VFS() {}

    VFS.prototype.read = function(path) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.write = function(path, data) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.exists = function(path) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.stats = function(path) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.size = function(path, deep) {
      if (deep == null) {
        deep = false;
      }
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.files = function(path, deep) {
      if (deep == null) {
        deep = false;
      }
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.del = function(path) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.rename = function(path, newName) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    VFS.prototype.mkdir = function(path) {
      return new Promise(function(resolve, reject) {
        return reject(new Error('Not implemented!'));
      });
    };

    return VFS;

  })();

  window.vfs = new VFS();

}).call(this);
