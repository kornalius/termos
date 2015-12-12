EventEmitter = require('eventemitter3')
PropertyAccessors = require('property-accessors')


module.exports = class TerminalChar extends EventEmitter

  PropertyAccessors.includeInto @


  constructor: (line, ch, options) ->
    EventEmitter @

    @line = line
    @ch = ' '
    @options = _.extend({}, options)


  destroy: ->
    @line = null
    @options = {}


  clear: ->
    @ch = ' '
    @options = {}
    return @


  invalidate: ->
    @line.invalidate()
    return @


  isEqualAttrs: (char) -> _.equal(@options.attrs, char.attrs)


  isEqual: (char) -> @ch == char.ch and @isEqualAttrs(char)

