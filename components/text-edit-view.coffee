{ BaseView, CustomEvent } = TOS
{ textarea, div, span, textcaretview } = TOS.html

# CodeMirror = require('codemirror')

{ TextBuffer, TextPoint, TextRegion } = require('./text/textbuffer')
{ TextCursor } = require('./text/textcursor')


TOS.TextEditView = class TextEditView extends BaseView

  css:
    '@font-face':
      'font-family': 'SourceCodePro'
      'src': "url('./fonts/SourceCodePro-ExtraLight.otf') format('woff')"
      'font-weight': 100

    ':host':
      'display': 'block'
      'height': '200px'
      'border': '1px solid black'
      'font-family': 'SourceCodePro, monospace'

  props:
    caretBlinkRate: 500
    caretExtraWidth: 0
    caretExtraHeight: 0

  #   mode: 'coffeescript'
  #   text: ''
  #   lineSeparator: null
  #   theme: null
  #   indentUnit: null
  #   smartIndent: null
  #   tabSize: null
  #   indentWithTabs: null
  #   electricChars: null
  #   specialChars: null
  #   specialCharPlaceholder: null
  #   rtlMoveVisually: null
  #   keyMap: null
  #   extraKeys: null
  #   lineWrapping: null
  #   lineNumbers: null
  #   firstLineNumber: null
  #   lineNumberFormatter: null
  #   gutters: null
  #   fixedGutter: null
  #   scrollbarStyle: null
  #   coverGutterNextToScrollbar: null
  #   inputStyle: null
  #   readOnly: null
  #   showCursorWhenSelecting: null
  #   lineWiseCopyCut: null
  #   undoDepth: null
  #   historyEventDelay: null
  #   tabindex: null
  #   autofocus: null
  #   dragDrop: null
  #   allowDropFileTypes: null
  #   cursorBlinkRate: 500
  #   cursorScrollMargin: null
  #   cursorHeight: null
  #   resetSelectionOnContextMenu: null
  #   workTime: null
  #   workDelay: null
  #   pollInterval: null
  #   flattenSpans: null
  #   addModeClass: null
  #   maxHighlightLength: null
  #   viewportMargin: null

  # options: (names, opts) ->
  #   for n in names.split(' ')
  #     a = @attr(n)
  #     if a?
  #       opts[n] = a

  # attached: ->
  #   super

  #   opts = {}
  #   @options 'lineNumbers mode text lineSeparator theme indentUnit smartIndent tabSize indentWithTabs electricChars keyMap extraKeys lineWrapping lineNumbers firstLineNumber lineNumberFormatter gutters fixedGutter scrollbarStyle coverGutterNextToScrollbar inputStyle readOnly showCursorWhenSelecting lineWiseCopyCut undoDepth historyEventDelay tabindex autofocus dragDrop allowDropFileTypes cursorBlinkRate cursorScrollMargin cursorHeight resetSelectionOnContextMenu workTime workDelay pollInterval flattenSpans addModeClass maxHighlightLength viewportMargin', opts

  #   @editor = CodeMirror.fromTextArea(@_el, opts)

  # render: ->
  #   textarea()

  @::accessor 'cursor', ->
    if @cursors.length == 0
      return @addCursor()
    else
      return @cursors[0]

  textChanged: (value) ->
    @async ->
      if value? and @_buffer? and @_buffer.text() != value
        @_buffer.setText(value)
        @setCursor()
        @invalidate()

  computeCharSize: ->
    testSpan = document.createElement('span')
    testSpan.textContent = '0123456789'
    @appendChild(testSpan)
    r = testSpan.getBoundingClientRect()
    @charSize =
      width: r.width / 10
      height: r.height
    testSpan.remove()

    r = @getBoundingClientRect()
    @_size = { width: Math.round(r.width / @charSize.width), height: Math.round(r.height / @charSize.height) }
    @_contentSize = @_size

  created: ->
    super

    @cursors = []
    @_viewport = { x: 0, y: 0 }
    @tabIndex = 0

  attached: ->
    super

    if @parentNode?
      @_buffer = new TextBuffer(@, '')
      @computeCharSize()
      @setCursor()

      @_buffer.on 'line:change', (row) =>
        @scrollInView()
        @invalidate()

      @_buffer.on 'line:insert', (row) =>
        @scrollInView()
        @invalidate()

      @_buffer.on 'line:delete', (row) =>
        @scrollInView()
        @invalidate()

      @_buffer.on 'reset', =>
        @scrollInView()
        @invalidate()

      @key ['mod+c', 'mod+x', 'mod+v', 'mod+z', 'mod+shift+z'], (e) => e.preventDefault()

      @key ['space'].concat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()[]{}\\|\'\";:,<.>/?-=_+".split('')), (e) =>
        console.log @, e
        for c in @cursors
          c.insert(String.fromCharCode(e.which))
        @scrollInView()
        e.stopPropagation()

      @key 'backspace', (e) =>
        for c in @cursors
          c.deleteBack()
        e.stopPropagation()

      @key ['ctrl+backspace', 'alt+backspace'], (e) =>
        for c in @cursors
          c.deleteWordBack()
        e.stopPropagation()

      @key 'del', (e) =>
        for c in @cursors
          c.deleteForward()
        e.stopPropagation()

      @key ['ctrl+del', 'alt+del'], (e) =>
        for c in @cursors
          c.deleteWordForward()
        e.stopPropagation()

      @key 'left', (e) =>
        for c in @cursors
          c.moveLeft()
        @scrollInView()
        e.stopPropagation()

      @key 'right', (e) =>
        for c in @cursors
          c.moveRight()
        @scrollInView()
        e.stopPropagation()

      @key 'up', (e) =>
        for c in @cursors
          c.moveUp()
        @scrollInView()
        e.stopPropagation()

      @key 'down', (e) =>
        for c in @cursors
          c.moveDown()
        @scrollInView()
        e.stopPropagation()

      @key ['ctrl+left', 'alt+left'], (e) =>
        for c in @cursors
          c.moveToPrevWord()
        @scrollInView()
        e.stopPropagation()

      @key ['ctrl+right', 'alt+right'], (e) =>
        for c in @cursors
          c.moveToNextWord()
        @scrollInView()
        e.stopPropagation()

      @key ['home', 'command+left'], (e) =>
        for c in @cursors
          c.moveToLineBegin()
        @scrollInView()
        e.stopPropagation()

      @key ['end', 'command+right'], (e) =>
        for c in @cursors
          c.moveToLineEnd()
        @scrollInView()
        e.stopPropagation()

      @key 'a b c', (e) =>
        console.log 'a b c pressed in sequence'
        e.stopPropagation()

  render: (content) ->
    cnt = []

    if @_buffer?
      for l in @_buffer.lines
        cnt.push div [
          span l
        ]
      for c in @cursors
        cnt.push textcaretview ".caret-view", textCursor: c, row: c.row, col: c.col, caretBlinkRate: @caretBlinkRate, caretExtraWidth: @caretExtraWidth, caretExtraHeight: @caretExtraHeight

    div '.edit-view', cnt

  pixelToTextPoint: (pixel) -> @textPoint(Math.trunc(pixel.y / @charSize.height), Math.trunc(pixel.x / @charSize.width))

  pixelToViewPoint: (pixel) -> @textPointToViewPoint(@pixelToTextPoint(pixel))

  textPointToPixel: (point) -> { x: Math.ceil(point.col * @charSize.width), y: Math.ceil(point.row * @charSize.height) }

  viewPointToPixel: (point) -> @textPointToPixel(@viewPointToTextPoint(point))

  textPointToViewPoint: (point) -> { x: point.col - @_viewport.x, y: point.row - @_viewport.y }

  viewPointToTextPoint: (viewpoint) -> @textPoint(viewpoint.y + @_viewport.y, viewpoint.x + @_viewport.x)

  viewPointToIndex: (viewpoint) -> @textPointToIndex(@viewPointToTextPoint(viewpoint))

  textPointToIndex: (point) ->
    if point.row < @_buffer.lineCount()
      l = @_buffer.text(point.row)
    else
      l = null
    if l?
      return point.row * @_size.width + point.col
    else
      return -1

  indexToTextPoint: (index) ->
    x = 0
    y = 0
    for l in @_buffer.lines
      prevx = x
      x += l.length
      if x > index
        return @textPoint(y, index - x)
      y++
    return null

  maxLineWidth: ->
    m = 0
    if @_buffer?
      for l in @_buffer.lines
        m = l.length if l.length > m
    return m

  textPoint: (row, col) ->
    if _.isNumber(row) and _.isNumber(col)
      return new TextPoint(@_buffer, row, col)
    else if row instanceof TextPoint
      return row.clone()
    else if _.isNumber(row)
      return @indexToTextPoint(row)
    else
      return new TextPoint(@_buffer, 0, 0)

  textRegion: (row, col, row2, col2) ->
    if _.isNumber(row) and _.isNumber(col) and _.isNumber(row2) and _.isNumber(col2)
      new TextRegion(@textPoint(row, col), @textPoint(row2, col2))
    else if _.isNumber(row) and _.isNumber(col)
      new TextRegion(@textPoint(row, col), @textPoint(row, col))
    else if row instanceof TextRegion
      new TextRegion(row.begin.clone(), row.end.clone())
    else if row instanceof TextPoint and col instanceof TextPoint
      new TextRegion(row.clone(), col.clone())
    else if row instanceof TextPoint
      new TextRegion(row.clone(), row.clone())
    else
      new TextRegion(@textPoint(), @textPoint())

  textRegionContains: (region, point, rect = false) ->
    r = region.ordered()
    if rect
      return point.row >= r.begin.row and point.row <= r.end.row and point.col >= r.begin.col and point.col <= r.end.col
    else
      point = @textPointToIndex(point)
      begin = @textPointToIndex(r.begin)
      end = @textPointToIndex(r.end) - 1
      return point >= begin and point <= end

  cursorToTextPoint: (cursor) ->
    if cursor?.region?
      return cursor.region.end
    else if cursor?.point?
      return cursor.point
    else
      return @textPoint()

  cursorRegion: (cursor) ->
    if cursor?.region?
      return cursor.region
    else if cursor?.point?
      return @textRegion(cursor.point)
    else
      return @textRegion()

  setCursor: (cursor, point) ->
    if !(cursor instanceof TextCursor)
      point = cursor
      cursor = null
    if !cursor?
      cursor = @cursor
    if !point?
      point = @textPoint()
    if @isValidTextPoint(point)
      cursor.moveTo(point)
    return cursor

  addCursor: (point) ->
    if !point?
      point = { row: 0, col: 0}

    cursor = null

    if @isValidTextPoint(point)
      cursor = new TextCursor(@_buffer, point)
      @cursors.push cursor

      @invalidate()

      cursor.on 'move', =>
        if cursor.caret?
          cursor.caret.updateCaret()
          @emit 'text.caret.view.move', target: cursor.caret
          @scrollInView()

    return cursor

  removeCursor: (cursor) ->
    if !(cursor instanceof TextCursor)
      point = cursor
      cursor = null
    if cursor? and cursor != @cursor
      _.remove(@cursors, cursor)
      @invalidate()
    return @

  moveCursor: (cursor, point) ->
    if !(cursor instanceof TextCursor)
      point = cursor
      cursor = null
    if !cursor?
      cursor = @cursor
    if @isValidTextPoint(point)
      cursor.moveTo(point)
    return @

  select: (cursor, region) ->
    if !(cursor instanceof TextCursor)
      region = cursor
      cursor = null
    if !cursor?
      cursor = @cursor
    if @isValidTextPoint(region.begin) and @isValidTextPoint(region.end)
      cursor.select(@textRegion(region))
    return @

  cursorAt: (point, regionOnly = false) ->
    for c in @cursors
      if c.point? and c.point.col == point.col and c.point.row == point.row and !regionOnly
        return c
      else if c.region? and @textRegionContains(c.region, point)
        return c
    return null

  cursorAtPixel: (pixel) -> @cursorAt(@pixelToTextPoint(pixel))

  isValidTextPoint: (point) -> (@_contentSize.width == 0 and @_contentSize.height == 0) or (point.col >= 0 and point.col < @_contentSize.width and point.row >= 0 and point.row < @_contentSize.height)

  scrollBy: (pos) ->
    for c in @cursors
      c.moveTo(@fromTextPoint(@cursorToTextPoint(tc)))
    @invalidate()
    return @

  scrollInView: (point, hcenter = false, vcenter = false) ->
    if !point?
      point = @cursorToTextPoint()
    if !point?
      point = @textPoint()
    # super @point(point.col, point.row), hcenter, vcenter

  onDown: (e) =>
    tpt = @pixelToTextPoint({ x: e.clientX, y: e.clientY })

    if !@_pressed?
      @_pressed = {}

    if !@_pressed.text?
      @_pressed.text = {}

    @_pressed.text.start = tpt.clone()
    @_pressed.text.pos = tpt
    @_pressed.text.distance = 0

    super e

    if !e.defaultPrevented
      if @_clickCount == 1
        @setCursor(@caret, @_pressed.text.pos)

      @scrollInView()
      @invalidate()

    e.stopPropagation()

  onMove: (e) =>
    super e

    if !e.defaultPrevented and @_pressed?
      tpt = @pixelToTextPoint(@_pressed.pixel.pos)
      @_pressed.text.pos = tpt
      @_pressed.text.distance = tpt.distance(@_pressed.text.start)
      tcp = @cursorToTextPoint(@caret)

      if tpt.row != tcp.row or tpt.col != tcp.col
        @select(@caret, @textRegion(@_pressed.text.start, tpt))
        @scrollInView()
        @invalidate()

    e.stopPropagation()

  onUp: (e) =>
    super e

    if !e.defaultPrevented and @_pressed?
      @scrollInView()
      @invalidate()

    e.stopPropagation()

  onDblClick: (e) =>
    super e

    debugger;

    if !e.defaultPrevented and @_pressed?
      tpt = @_pressed.text.pos
      r = @_buffer.wordAt(tpt.row, tpt.col)
      @select(@caret, r)
      @scrollInView()
      @invalidate()

    e.stopPropagation()


TextEditView.register()
