EventEmitter = require('eventemitter3')
PropertyAccessors = require('property-accessors')
TerminalChar = require('./terminal-char')


NODE_UNKNOWN = 0
NODE_STRING = 1
NODE_ELEMENT = 2


cancel = (e) ->
  e.preventDefault() if e.preventDefault
  e.stopPropagation() if e.stopPropagation
  e.cancelBubble = true
  false

module.exports = class TerminalLine extends EventEmitter

  PropertyAccessors.includeInto @


  constructor: (terminal, options) ->
    EventEmitter @

    @terminal = terminal

    @nodes = []

    @element = @terminal.document.createElement('div')
    $(@element)
      .addClass('line terminal-line')
      .attr(tabindex: '0', spellcheck: 'false')
    @terminal.element.appendChild(@element)

    @options = _.extend({}, options)

    @charWidth = @terminal.charWidth
    @charHeight = @terminal.charHeight

    @cols = @terminal.cols
    @rows = @terminal.rows

    @clear()

    addEventListener 'resize', => @resize()

    addEventListener 'mousedown', (e) =>

    addEventListener 'mousemove', (e) =>

    addEventListener 'mouseup', up = (e) =>
      cancel e

    addEventListener 'load', =>
      @resize()


  destroy: ->
    @clearElements()
    @element.remove()
    @element = null
    @terminal = null
    @nodes = []
    @options = {}


  clearElements: ->
    for n in @element.childNodes
      n.remove()
    return @


  clear: ->
    @clearElements()
    if !@nodes?
      @nodes = new Array(@cols)
    for x in [0...@cols]
      @nodes[x] = ' '
    @invalidate()
    return @


  invalidate: ->
    if !_.contains(@terminal.dirty, @)
      @terminal.dirty.push @
    return @


  isDirty: -> _.contains(@terminal.dirty, @)


  lineNo: -> @terminal.lines.indexOf(@)


  buildLine: ->
    for n in @element.childNodes
      n.remove()
    for el in @toElements()
      @element.appendChild(el)
    return @


  toString: (start, end) ->
    s = ''
    start = start or 0
    end = end or @cols - 1
    for i in [Math.max(0, start)..Math.min(@cols - 1, end)]
      if _.isElement(@nodes[i])
        s += @nodes[i].outerHTML
      else if _.isString(@nodes[i])
        s += @nodes[i][0]
    return s


  toElements: (start, end) ->
    elements = []
    text = ''
    doc = @terminal.document

    _textToElement = ->
      el = doc.createElement('span')
      el.textContent = text
      text = ''
      return el

    start = start or 0
    end = end or @cols - 1
    for i in [Math.max(0, start)..Math.min(@cols - 1, end)]
      if _.isString(@nodes[i])
        text += @nodes[i][0]

      else if _.isElement(@nodes[i])
        if text.length
          el = _textToElement()
          elements.push el
        elements.push @nodes[i]

    if text.length
      el = _textToElement()
      elements.push el

    return elements


  parseString: (str) ->
    parts = []
    _elements = @terminal.document.createElement('span')
    _elements.innerHTML = str
    console.log _elements
    parts.push _elements.textContent
    for el in _elements.childNodes
      if el.tagName == 'SPAN'
        parts.push el.textContent
      else
        parts.push el
    return parts


  _writeString: (str, index = 0) ->
    for ch in str
      if index >= 0 and index < @cols
        @nodes[index++] = ch
      else
        break
    return index


  _writeElement: (element, index = 0) ->
    if index >= 0 and index < @cols
      @nodes[index] = element
      index += @nodeWidth(element)
    return index


  write: (data, index = 0) ->
    if _.isString(data)
      for p in @parseString(data)
        if _.isString(p)
          index = @_writeString(p, index)
        else
          index = @_writeElement(p, index)

    else if _.isArray(data)
      for p in data
        index = @write(p, index)

    else if _.isElement(data)
      index = @_writeElement(data, index)

    @invalidate()

    return index


  replace: (data) ->
    @clear()
    @write(data)
    return @


  erase: (start, count = 1) -> @eraseRange(start, start + count)


  eraseRange: (start, end) ->
    for i in [Math.max(0, start)..Math.min(@cols - 1, end)]
      @nodes[i] = ' '
    @invalidate()
    return @


  nodeAt: (index) ->
    if index >= 0 and index < @cols
      return @nodes[index]
    return null


  nodeTypeAt: (index) ->
    n = @nodeAt(index)
    if n?
      if _.isElement(n)
        return NODE_ELEMENT
      else if _.isString(n)
        return NODE_STRING
    return NODE_UNKNOWN


  isNodeChar: (index) -> @nodeTypeAt(index) == NODE_STRING


  isNodeElement: (index) -> @nodeTypeAt(index) == NODE_ELEMENT


  nodeWidth: (index) ->
    n = @nodeAt(index)
    if n?
      w = 0
      if @isNodeChar(n)
        w += @charWidth
      else if @isNodeElement(n)
        w += n.offsetWidth
      return Math.trunc(w / @charWidth)
    return 1


  offset: -> { x: @element.offsetLeft, y: @element.offsetTop }


  size: -> { width: @element.offsetWidth, height: @element.offsetHeight }


  rect: -> { x: @element.offsetLeft, y: @element.offsetTop, width: @element.offsetWidth, height: @element.offsetHeight }


  resize: ->

