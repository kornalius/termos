require('timmy')

Math.round = (value, places, increment) ->
  increment = increment || 1e-20
  factor = 10 / (10 * (increment || 10))
  return (Math.ceil(factor * +value) / factor).toFixed(places) * 1

Math.roundCeil = (value, places) ->
  powed = Math.pow(10, places)
  return Math.ceil(value * powed) / powed

Number.prototype.sign = (value) ->
  if value > 0
    return 1
  else if value < 0
    return -1
  else
    return 0

Math.wrap = Math.pinch = (value, min, max) ->
  if min > max
    [min, max] = [max, min]
  if value < min
    return min
  else if value > max
    return max
  else
    return value

Math.loop = (value, min, max) ->
  if min is max
    return min
  else
    if min > max
      [min, max] = [max, min]
    vol = max - min
    val = value - max
    while val < 0
      val += vol
    return (val % vol) + min

Math.add = (value, nums...) ->
  value += num for num in nums
  return value

Math.sub = (value, nums...) ->
  value -= num for num in nums
  return value

Math.mul = (value, nums...) ->
  value *= num for num in nums
  return value

Math.div = (value, nums...) ->
  value /= num for num in nums
  return value

Math.radToDeg = (value) -> value * 57.29577951308232

Math.degToRad = (value) -> value * 0.017453292519943295

Math.clockwise = (from, to, range) ->
  while to > from
    to -= range
  while to < from
    to += range
  return to - from

Math.nearer = (from, to, range) ->
  c = Math.clockwise(from, to, range)
  if c >= range * 0.5
    return c - range
  else
    return c

Math.average = (value, nums...) ->
  return Math.add(value, nums...) / arguments.length

Math.between = (from, to, ratio) ->
  return from + (to - from) * ratio

oldMathRandom = Math.random
Math.random = (nums...) ->
  if nums.length is 0
    oldMathRandom()
  else if nums.length is 1
    oldMathRandom() * nums[0]
  else
    oldMathRandom() * (nums[1] - nums[0]) + nums[0]


Number.prototype.roundCeil = (places) -> Math.roundCeil @, places

Number.prototype.sign = -> Math.sign @

Number.prototype.loop = (min, max) -> Math.wrap @, min, max

Number.prototype.add = (nums...) -> Math.add @, nums...

Number.prototype.sub = (nums...) -> Math.sub @, nums...

Number.prototype.mul = (nums...) -> Math.mul @, nums...

Number.prototype.div = (nums...) -> Math.div @, nums...

Number.prototype.radToDeg = -> Math.radToDeg @

Number.prototype.degToRad = -> Math.degToRad @
