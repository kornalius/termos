EventEmitter = require('eventemitter3')
PropertyAccessors = require('property-accessors')
TerminalInput = require('./terminal-input')
TerminalLine = require('./terminal-line')
TerminalCursor = require('./terminal-cursor')
raf = require('raf')


S_NONE = 0
S_RENDERING = 1

module.exports._status = _status = S_NONE
module.exports._dirty = _dirty = []

raf _renderLines = ->

  _status = S_RENDERING
  if _dirty.length
    t = _.clone(_dirty)
    _dirty.length = 0
    for l in t
      l.buildLine()
  _status = S_NONE

  raf _renderLines


cancel = (e) ->
  e.preventDefault() if e.preventDefault
  e.stopPropagation() if e.stopPropagation
  e.cancelBubble = true
  false


module.exports = class Terminal extends EventEmitter

  PropertyAccessors.includeInto @


  @::accessor 'topRow', ->  Math.trunc(window.scrollY / @charHeight)


  @::accessor 'bottomRow', ->  @topRow + @rows - 1


  @::accessor 'currentLine', -> @lines[_.pinch(@cursor._y, 0, @rows - 1)]


  constructor: (parent, options) ->
    EventEmitter @

    @document = parent.ownerDocument

    @lines = []
    @buffer = []
    @inputMode = false

    @element = parent

    $(@element)
      .addClass('terminal focus')
      .attr(tabindex: '0', spellcheck: 'false')

    @_metric_el = @document.createElement('span')
    $(@_metric_el).addClass('terminal-metric')
    @_metric_el.textContent = 'W'
    @element.appendChild(@_metric_el)

    r = @_metric_el.getBoundingClientRect()
    @charWidth = r.width;
    @charHeight = r.height;

    @dirty = _dirty
    @status =  _status

    @options = _.extend({ cols: Math.trunc(@element.offsetWidth / @charWidth), rows: Math.trunc(@element.offsetHeight / @charHeight) }, options)

    @cols =  @options.cols
    @rows =  @options.rows

    @cursor = new TerminalCursor(@, blink: true)

    @clear()

    @input = new TerminalInput(@, '', {})

    addEventListener 'focus', @focus.bind(@)

    addEventListener 'blur', @blur.bind(@)

    addEventListener 'resize', => @resize()

    @element.addEventListener 'load', =>
      @nativeScrollTo(0)
    , true

    addEventListener 'contextmenu', (e) => cancel e

    addEventListener 'keydown', (e) =>

    addEventListener 'keypress', (e) =>

    addEventListener 'mousedown', (e) =>

    addEventListener 'mousemove', (e) =>

    addEventListener 'mouseup', up = (e) =>
      cancel e

    # addEventListener 'wheel', (e) =>
      # cancel e

    addEventListener 'load', =>
      @resize()

    _renderLines()

    @focus()

    @input.start()


  destroy: ->
    @clear()
    for l in @lines
      l.destroy()
    @lines = []
    for l in @buffer
      l.remove()
    @buffers = []
    @input.destroy()
    @input = null
    @cursor.destroy()
    @cursor = null
    @element = null
    @document = null
    @options = {}


  focus: ->
    $(@element).removeClass('focus blur').addClass('focus')
    @element.focus()
    if @cursor._prevVisible
      @cursor.show()
    return @


  blur: ->
    $(@element).removeClass('focus blur').addClass('blur')
    @element.blur()
    @cursor._prevVisible = @cursor.visible
    @cursor.hide()
    return @


  clear: ->
    @clearBuffer()
    @clearScreen()


  clearScreen: ->
    for l in @lines
      l.destroy()
    @lines = []
    for i in [0...@rows]
      @lines.push new TerminalLine(@, {})
    return @


  clearBuffer: ->
    for l in @buffer
      l.remove()
    @buffer = []
    return @


  write: (data) ->
    if _.isString(data)
      lines = data.split('\n')
      len = lines.length - 1
      for i in [0..len]
        l = lines[i]
        @currentLine.write(l)
        if i < len
          @cursor.cr()
    else if _.isArray(data)
      for n in data
        @write(n)
    else if _.isElement(data)
      @currentLine.write(data)
    return @


  writeln: (data) ->
    @write(data)
    @cursor.cr()
    return @


  scrollLinesBy: (y) ->
    while y > 0
      @lines[0].element.classList.remove('terminal-line')
      for i in [0...@rows - 1]
        @lines[i] = @lines[i + 1]
      @lines[@rows - 1] = new TerminalLine(@, {})
      y--
    return @


  pixelToPos: (x, y) -> { x: Math.trunc(x / @charWidth), y: x: Math.trunc(y / @charHeight) }


  posToPixel: (x, y) -> { x: Math.trunc(x * @charWidth), y: x: Math.trunc(y * @charHeight) }


  posInRect: (x, y, rect) -> x >= rect.x and x <= rect.x + rect.width and y >= rect.y and y <= rect.y + rect.height


  posToIndex: (x, y) -> Math.trunc(y * @options.cols + x)


  indexToPos: (index) ->
    y = Math.trunc(index / @options.cols)
    x = index - (y * @options.cols)
    return { x: x, y: y }


  charAt: (x, y) ->
    node = @nodeAtPos(x, y)
    if node? and @isWordNode(node)
      return @nodeCharAt(node, x)
    else
      return null


  setCharAt: (x, y, ch) ->
    node = @nodeAtPos(x, y)
    if @isWordNode(node)
      @setNodeCharAt(node, x, ch)
    return @


  nodeAtPos: (x, y) ->
    for node in @nodesInLine(y)
      r = @nodeRect(node)
      if x >= r.x and x <= r.x + r.width
        return node
    return null


  nodeAtPixel: (x, y) ->
    { x, y } = @pixelToPos(x, y)
    @nodeAtPos(x, y)


  nodePos: (node) ->
    { x, y } = @nodePixel(node)
    @pixelToPos(x, y)


  nodePixel: (node) -> { x: node.offsetLeft + (if node.offsetParent? then node.offsetParent.offsetLeft else 0), y: node.offsetTop + (if node.offsetParent? then node.offsetParent.offsetTop else 0) }


  nodeSize: (node) ->
    { width, height } = @nodeSizePixel(node)
    @pixelToPos(width, height)


  nodeSizePixel: (node) -> { width: node.offsetWidth, height: node.offsetHeight }


  nodeWidth: (node) -> @nodeSize(node).width


  nodeRect: (node) ->
    { x, y } = @nodePos(node)
    { width, height } = @nodeSize(node)
    return { x: x, y: y, width: width, height: height }


  nodeRectPixel: (node) ->
    { x, y } = @nodePixel(node)
    { width, height } = @nodeSizePixel(node)
    return { x: x, y: y, width: width, height: height }


  nativeScrollTo: (scroll = 2000000000) ->
    window.scrollTo(0, scroll)
    return @


  scrollDisplay: (disp) ->
    @nativeScrollTo(window.scrollY + disp)
    return @


  resize: ->


  inputExecuted: (str) ->
    if @cursor.y + 1 > @rows - 1
      @scrollLinesBy(1)
      @cursor.scrollInView()


  inputStarted: ->


  inputEnded: ->
    @input.start()
