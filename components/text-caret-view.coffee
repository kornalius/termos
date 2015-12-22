{ BaseView, CustomEvent } = TOS
{ textarea, div, span } = TOS.html

{ TextBuffer, TextPoint, TextRegion } = require('./text/textbuffer')
{ TextCursor } = require('./text/textcursor')


TOS.TextCaretView = class TextCaretView extends BaseView

  css:
    ':host':
      'display': 'block'
      'position': 'absolute'
      'background-color': 'black'

  attrs:
    caretBlinkRate: 500
    caretExtraWidth: 0
    caretExtraHeight: 0

  @::accessor 'parentView', -> @parentNode.parentNode

  @::accessor '_buffer', -> @parentView._buffer

  @::accessor 'charWidth', -> @parentView.charSize.width

  @::accessor 'charHeight', -> @parentView.charSize.height

  ready: ->
    @pos = { x: 0, y: 0 }

  attached: ->
    super
    @cursor = new TextCursor(@_buffer, 0, 0)
    @_updateCaret()

    if @attr 'caretBlinkRate' != 0
      @_blinker = setInterval(=>
        @toggleAttr 'hidden'
      , @attr 'caretBlinkRate')

  _updateCaret: ->
    @style.width = @charWidth + @caretExtraWidth + 'px'
    @style.height = @charHeight @caretExtraHeight + 'px'
    @style.left = @pos.x * @charWidth + 'px'
    @style.top = @pos.y * @charHeight + 'px'

  caretExtraWidthChanged: ->
    @_updateCaret()

  caretExtraHeightChanged: ->
    @_updateCaret()

  detached: ->
    super
    clearInterval @_blinker

  render: ->
    div '.text-caret-view'

  moveTo: (x, y) ->
    if x instanceof TextPoint
      y = x.row
      x = x.col
    @cursor.moveTo(y, x)
    @pos = { x: x, y: y }
    @_updateCaret()

  moveBy: (x, y) ->
    if x instanceof TextPoint
      y = x.row
      x = x.col
    @moveTo(@pos.x + x, @pos.y + y)

  home: -> @moveTo(0, 0)

  end: -> @moveTo(@parentView._size.width - 1, @parentView._size.height - 1)

  bol: -> @moveTo(0, @pos.y)

  eol: -> @moveTo(@parentView._size.width - 1, @pos.y)

  cr: -> @down().bol()

  lf: -> @down()

  bs: -> @left()

  del: -> @parentView.eraseAt(@pos)

  tab: -> @moveBy(2, 0)

  isBol: -> @pos.x == 0

  isEol: -> @pos.x == @parentView._size.width - 1

  isHome: -> @isBol() and @pos.y == 0

  isEnd: -> @isEol() and @pos.y == @parentView._size.height - 1

  left: (count) ->
    if !count?
      count = 1
    @moveBy(-count, 0)
    return @

  right: (count) ->
    if !count?
      count = 1
    @moveBy(count, 0)
    return @

  up: (count) ->
    if !count?
      count = 1
    @moveBy(0, -count)
    return @

  down: (count) ->
    if !count?
      count = 1
    @moveBy(0, count)
    return @


TextCaretView.register()
