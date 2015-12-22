(function() {
  var Theme, cson, dirs, fs, loadSetting, path;

  fs = TOS.fs, path = TOS.path, dirs = TOS.dirs, cson = TOS.cson, loadSetting = TOS.loadSetting;

  TOS.Theme = Theme = (function() {
    function Theme() {}

    Theme.load = function(name, macros) {
      return loadSetting("themes/" + name + "/index.cson", function(err, p, data) {
        var f, i, len, ref, results;
        if (err == null) {
          ref = data.files;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            f = ref[i];
            results.push(loadCSS(path.join(path.dirname(p), f), name, macros));
          }
          return results;
        }
      });
    };

    Theme.unload = function(name) {
      return unloadCSS(name);
    };

    return Theme;

  })();

}).call(this);
