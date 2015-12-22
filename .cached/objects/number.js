(function() {
  var oldMathRandom,
    slice = [].slice;

  require('timmy');

  Math.round = function(value, places, increment) {
    var factor;
    increment = increment || 1e-20;
    factor = 10 / (10 * (increment || 10));
    return (Math.ceil(factor * +value) / factor).toFixed(places) * 1;
  };

  Math.roundCeil = function(value, places) {
    var powed;
    powed = Math.pow(10, places);
    return Math.ceil(value * powed) / powed;
  };

  Number.prototype.sign = function(value) {
    if (value > 0) {
      return 1;
    } else if (value < 0) {
      return -1;
    } else {
      return 0;
    }
  };

  Math.wrap = Math.pinch = function(value, min, max) {
    var ref;
    if (min > max) {
      ref = [max, min], min = ref[0], max = ref[1];
    }
    if (value < min) {
      return min;
    } else if (value > max) {
      return max;
    } else {
      return value;
    }
  };

  Math.loop = function(value, min, max) {
    var ref, val, vol;
    if (min === max) {
      return min;
    } else {
      if (min > max) {
        ref = [max, min], min = ref[0], max = ref[1];
      }
      vol = max - min;
      val = value - max;
      while (val < 0) {
        val += vol;
      }
      return (val % vol) + min;
    }
  };

  Math.add = function() {
    var i, len, num, nums, value;
    value = arguments[0], nums = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = nums.length; i < len; i++) {
      num = nums[i];
      value += num;
    }
    return value;
  };

  Math.sub = function() {
    var i, len, num, nums, value;
    value = arguments[0], nums = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = nums.length; i < len; i++) {
      num = nums[i];
      value -= num;
    }
    return value;
  };

  Math.mul = function() {
    var i, len, num, nums, value;
    value = arguments[0], nums = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = nums.length; i < len; i++) {
      num = nums[i];
      value *= num;
    }
    return value;
  };

  Math.div = function() {
    var i, len, num, nums, value;
    value = arguments[0], nums = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    for (i = 0, len = nums.length; i < len; i++) {
      num = nums[i];
      value /= num;
    }
    return value;
  };

  Math.radToDeg = function(value) {
    return value * 57.29577951308232;
  };

  Math.degToRad = function(value) {
    return value * 0.017453292519943295;
  };

  Math.clockwise = function(from, to, range) {
    while (to > from) {
      to -= range;
    }
    while (to < from) {
      to += range;
    }
    return to - from;
  };

  Math.nearer = function(from, to, range) {
    var c;
    c = Math.clockwise(from, to, range);
    if (c >= range * 0.5) {
      return c - range;
    } else {
      return c;
    }
  };

  Math.average = function() {
    var nums, value;
    value = arguments[0], nums = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Math.add.apply(Math, [value].concat(slice.call(nums))) / arguments.length;
  };

  Math.between = function(from, to, ratio) {
    return from + (to - from) * ratio;
  };

  oldMathRandom = Math.random;

  Math.random = function() {
    var nums;
    nums = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (nums.length === 0) {
      return oldMathRandom();
    } else if (nums.length === 1) {
      return oldMathRandom() * nums[0];
    } else {
      return oldMathRandom() * (nums[1] - nums[0]) + nums[0];
    }
  };

  Number.prototype.roundCeil = function(places) {
    return Math.roundCeil(this, places);
  };

  Number.prototype.sign = function() {
    return Math.sign(this);
  };

  Number.prototype.loop = function(min, max) {
    return Math.wrap(this, min, max);
  };

  Number.prototype.add = function() {
    var nums;
    nums = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Math.add.apply(Math, [this].concat(slice.call(nums)));
  };

  Number.prototype.sub = function() {
    var nums;
    nums = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Math.sub.apply(Math, [this].concat(slice.call(nums)));
  };

  Number.prototype.mul = function() {
    var nums;
    nums = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Math.mul.apply(Math, [this].concat(slice.call(nums)));
  };

  Number.prototype.div = function() {
    var nums;
    nums = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Math.div.apply(Math, [this].concat(slice.call(nums)));
  };

  Number.prototype.radToDeg = function() {
    return Math.radToDeg(this);
  };

  Number.prototype.degToRad = function() {
    return Math.degToRad(this);
  };

}).call(this);
