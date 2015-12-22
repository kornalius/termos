(function() {
  var slice = [].slice;

  Boolean.prototype.not = function() {
    return !this.valueOf();
  };

  Boolean.prototype.or = function() {
    var a, bools, i, len, r;
    bools = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    r = this.valueOf();
    for (i = 0, len = bools.length; i < len; i++) {
      a = bools[i];
      r = r || _.toBoolean(a);
    }
    return b(r);
  };

  Boolean.prototype.xor = function() {
    var a, bools, i, len, r;
    bools = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    r = this.valueOf();
    for (i = 0, len = bools.length; i < len; i++) {
      a = bools[i];
      r = r ^ _.toBoolean(a);
    }
    return b(r);
  };

  Boolean.prototype.and = function() {
    var a, bools, i, len, r;
    bools = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    r = this.valueOf();
    for (i = 0, len = bools.length; i < len; i++) {
      a = bools[i];
      r = r && _.toBoolean(a);
    }
    return b(r);
  };

}).call(this);
