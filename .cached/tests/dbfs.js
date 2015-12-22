(function() {
  dbfs.clear().then(function() {
    return dbfs.write('/My Documents/Alain Deschênes', 'Alain Deschênes').then(function() {
      return dbfs.write('/My Documents/Mélissa Dubé', 'Mélissa Dubé').then(function() {
        dbfs.read('/My Documents/Mélissa Dubé').then(function(doc) {
          return console.log(doc);
        })["catch"](function(err) {
          return console.log(err);
        });
        dbfs.stats('/My Documents/Mélissa Dubé').then(function(stats) {
          return console.log(stats);
        })["catch"](function(err) {
          return console.log(err);
        });
        return dbfs.files('/My Documents').then(function(files) {
          return console.log(files);
        })["catch"](function(err) {
          return console.log(err);
        });
      })["catch"](function(err) {
        return console.log(err);
      });
    })["catch"](function(err) {
      return console.log(err);
    });
  });

}).call(this);
