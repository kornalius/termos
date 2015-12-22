(function() {
  var File, lfs;

  lfs = TOS.lfs;

  TOS.File = File = (function() {
    function File(path) {
      this.path = path;
    }

    File.prototype.isFile = function() {
      return lfs.isFile(this.path);
    };

    File.prototype.isFolder = function() {
      return lfs.isFile(this.path);
    };

    File.prototype.read = function() {
      return lfs.read(this.path);
    };

    File.prototype.write = function(data) {
      return lfs.write(this.path, data);
    };

    File.prototype.exists = function() {
      return lfs.exists(this.path);
    };

    File.prototype.stats = function() {
      return lfs.stats(this.path);
    };

    File.prototype.size = function(deep) {
      if (deep == null) {
        deep = false;
      }
      return lfs.size(this.path, deep);
    };

    File.prototype.files = function(deep) {
      if (deep == null) {
        deep = false;
      }
      return lfs.files(this.path, deep);
    };

    File.prototype.del = function() {
      return lfs.del(this.path);
    };

    File.prototype.rename = function(newName) {
      return lfs.rename(this.path, newName);
    };

    File.prototype.mkdir = function() {
      return lfs.mkdir(this.path);
    };

    return File;

  })();

}).call(this);
