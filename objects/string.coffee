Scanner = require('str-scan')

String.prototype.parse = TOS.instanceFunction(require('levn').parse)

String.prototype.format = TOS.instanceFunction(require('string-kit').format)

String.prototype.scan = -> new Scanner(@valueOf())

oldReplace = String.prototype.replace
String.prototype.replace = (find, replace, ignorecase) -> oldReplace.call(@valueOf(), find, replace, (if ignorecase then 'i' else ''))

TOS.instanceFunctions(String, require('underscore.string').exports(), ['chop', 'classify', 'clean', 'count', 'lastIndexOf', 'levenshtein', 'replaceAll', 'sprintf', 'surround', 'swapCase', 'uncamelcase', 'uncapitalize', 'undasherize', 'unsurround', 'upper', 'lower'])
