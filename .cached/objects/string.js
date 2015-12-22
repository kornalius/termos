(function() {
  var Scanner, oldReplace;

  Scanner = require('str-scan');

  String.prototype.parse = TOS.instanceFunction(require('levn').parse);

  String.prototype.format = TOS.instanceFunction(require('string-kit').format);

  String.prototype.scan = function() {
    return new Scanner(this.valueOf());
  };

  oldReplace = String.prototype.replace;

  String.prototype.replace = function(find, replace, ignorecase) {
    return oldReplace.call(this.valueOf(), find, replace, (ignorecase ? 'i' : ''));
  };

  TOS.instanceFunctions(String, require('underscore.string').exports(), ['chop', 'classify', 'clean', 'count', 'lastIndexOf', 'levenshtein', 'replaceAll', 'sprintf', 'surround', 'swapCase', 'uncamelcase', 'uncapitalize', 'undasherize', 'unsurround', 'upper', 'lower']);

}).call(this);
