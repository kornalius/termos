TOS.instanceFunctions(Array, _, ['best', 'chunk', 'chunkAll', 'dropWhile', 'fill', 'interpose', 'keep', 'keepIndexed', 'partitionBy', 'reductions', 'repeat', 'rest', 'second', 'shuffle', 'slice', 'splitAt', 'splitWith', 'take', 'takeRight', 'takeSkipping', 'takeWhile', 'third', 'without', 'xor'])

TOS.instanceFunctions(Array, require('underscore.array'), ['dig', 'rotate', 'samples'])

if !window.alasql
  alasql = require('alasql')

Array.prototype.query = (sql) -> alasql(sql, @)
