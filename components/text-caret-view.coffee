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

  props:
    caretBlinkRate: 500
    caretExtraWidth: 0
    caretExtraHeight: 0
    textCursor: null

  attrs:
    row: 0
    col: 0

  @::accessor 'parentView', -> @parentNode?.parentNode

  @::accessor '_buffer', -> @parentView?._buffer

  @::accessor 'charWidth', -> if @parentView? then @parentView.charSize.width else 0

  @::accessor 'charHeight', -> if @parentView? then @parentView.charSize.height else 0

  @::accessor 'row', -> if @parentView? then @parentView.cursorToTextPoint(@textCursor).row else 0

  @::accessor 'col', -> if @parentView? then @parentView.cursorToTextPoint(@textCursor).col else 0

  attached: ->
    super
    @updateCaret()

    # if @caretBlinkRate != 0
      # @_blinker = setInterval(=>
        # @toggleAttr 'hidden'
      # , @caretBlinkRate)

  updateCaret: ->
    if @parentView?
      @style.width = @charWidth + @caretExtraWidth + 'px'
      @style.height = @charHeight + @caretExtraHeight + 'px'
      @style.left = @col * @charWidth + 'px'
      @style.top = @row * @charHeight + 'px'

  textCursorChanged: (textCursor) ->
    textCursor.caret = @
    @updateCaret()

  rowChanged: (row) ->
    @row = row
    @updateCaret()

  colChanged: (col) ->
    @col = col
    @updateCaret()

  caretExtraWidthChanged: ->
    @updateCaret()

  caretExtraHeightChanged: ->
    @updateCaret()

  detached: ->
    super
    clearInterval @_blinker

  # render: ->
    # div '.text-caret-view'

  moveTo: (row, col) ->
    if row instanceof TextPoint
      col = row.row
      row = row.col
    @textCursor.moveTo(row, col)

  moveBy: (row, col) ->
    if row instanceof TextPoint
      col = row.row
      row = row.col
    @moveTo(@row + col, @col + row)

  home: -> @moveTo(0, 0)

  end: -> @moveTo(@parentView._size.width - 1, @parentView._size.height - 1)

  bol: -> @moveTo(0, @row)

  eol: -> @moveTo(@parentView._size.width - 1, @row)

  cr: -> @down().bol()

  lf: -> @down()

  bs: -> @left()

  # del: -> @parentView.eraseAt(@pos)

  tab: -> @moveBy(2, 0)

  isBol: -> @col == 0

  isEol: -> @col == @parentView._size.width - 1

  isHome: -> @isBol() and @row == 0

  isEnd: -> @isEol() and @row == @parentView._size.height - 1

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
