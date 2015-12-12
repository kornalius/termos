EventEmitter = require('eventemitter3')
PropertyAccessors = require('property-accessors')


module.exports = class TermimalCursor extends EventEmitter

  PropertyAccessors.includeInto @


  @::accessor 'index',
    get: ->  @terminal.posToIndex(@x, @y)
    set: (value) ->
      { x, y } = @terminal.indexToPos(value)
      @_x = x
      @_y = y
      @moveTo(@_x, @_y)


  @::accessor 'x',
    get: ->  @_x
    set: (value) ->
      if value != @_x
        @_x = value
        @moveTo(@_x, @_y)


  @::accessor 'y',
    get: ->  @_y
    set: (value) ->
      if value != @_y
        @_y = value
        @moveTo(@_x, @_y)


  @::accessor 'blinkSpeed',
    get: -> @options.blink
    set: (value) ->
      if @options.blink != value
        @stopBlink()
        @options.blink = value
        @startBlink()


  @::accessor 'visible',
    get: -> @options.visible
    set: (value) ->
      if @options.visible != value
        @options.visible = value


  constructor: (terminal, x, y, options) ->
    EventEmitter @

    @terminal = terminal

    @options = _.extend({ blink: 500, visible: false }, options)

    @charWidth = @terminal.charWidth
    @charHeight = @terminal.charHeight

    @cols = @terminal.cols
    @rows = @terminal.rows

    @element = @terminal.document.createElement('div')
    $(@element).addClass('terminal-cursor')
    @terminal.element.appendChild(@element)

    @_x = 0
    @_y = 0
    @_prevVisible = @visible

    @resize()

    if @visible
      @show()
    else
      @hide()


  destroy: ->
    @stopBlink()
    @terminal = null
    @element.remove()
    @element = null


  startBlink: ->
    @_interval = setInterval(=>
      $(@element).toggleClass('reverse')
    , @blinkSpeed)
    return @


  stopBlink: ->
    clearInterval(@_interval)
    @_interval = null
    return @


  show: ->
    @visible = true
    $(@element).css(visibility: 'visible')
    return @


  hide: ->
    @visible = false
    $(@element).css(visibility: 'hidden')
    return @


  moveTo: (x, y) ->
    @_x = _.pinch(x, 0, @cols - 1)
    @_y = _.pinch(y, 0, @rows - 1)
    $(@element).css(left: "#{@charWidth * @_x}px", top: "#{@terminal.lines[0].element.offsetTop + @charHeight * @_y}px")
    return @


  moveBy: (x, y) -> @moveTo(@_x + x, @_y + y)


  resize: ->
    $(@element).css(width: "#{@charWidth}px", height: "#{@charHeight}px")
    return @


  scrollInView: ->
    @element.scrollIntoView(false, false)
    return @


  isAtBegin: (x) -> (x || @_x) == 0


  isAtEnd: (x) -> (x || @_x) == @cols - 1


  isAtTop: (y) -> (y || @_y) == 0


  isAtBottom: (y) -> (y || @_y) == @rows - 1


  moveLeft: (n = 1) -> @moveBy(-n, 0)


  moveRight: (n = 1) -> @moveBy(n, 0)


  moveUp: (n = 1) -> @moveBy(0, -n)


  moveDown: (n = 1) -> @moveBy(0, n)


  moveToBegin: -> @moveTo(0, 0)


  moveToEnd: -> @moveTo(@cols - 1, @rows - 1)


  moveToLineBegin: -> @moveTo(0, @_y)


  moveToLineEnd: -> @moveTo(@cols - 1, @_y)


  cr: (n = 1) ->
    @moveDown(n)
    @moveToLineBegin()
