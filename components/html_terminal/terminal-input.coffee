EventEmitter = require('eventemitter3')
PropertyAccessors = require('property-accessors')


cancel = (e) ->
  e.preventDefault() if e.preventDefault
  e.stopPropagation() if e.stopPropagation
  e.cancelBubble = true
  false


module.exports = class TerminalInput extends EventEmitter

  PropertyAccessors.includeInto @


  @::accessor 'index',
    get: ->  @_index
    set: (value) ->
      @moveTo(value)


  @::accessor 'value',
    get: ->  @_value
    set: (value) ->
      if !_.isEqual(@_value, value)
        if !_.isArray(value)
          value = value.toString().split('')
        @_value = value
        @invalidate()
        # @moveTo(@length)


  @::accessor 'length', ->  @_value.length


  @::accessor 'maxHistory',
    get: ->  @options.maxHistory
    set: (value) ->
      if @options.maxHistory != value
        @options.maxHistory = value


  @::accessor 'enabled',
    get: ->  @_enabled
    set: (value) ->
      if value
        @start()
      else
        @stop()


  constructor: (terminal, value, options) ->
    EventEmitter @

    @_value = []
    @_index = 0

    @terminal = terminal
    @cursor = terminal.cursor

    @options = _.extend({ maxHistory: 1000 }, options)

    @charWidth = @terminal.charWidth
    @charHeight = @terminal.charHeight

    @cols = @terminal.cols
    @rows = @terminal.rows

    @history = []
    @historyPtr = -1

    @undoStack = []
    @redoStack = []
    @noHistory = true
    @currentSteps = []

    @_enabled = false

    @clear()

    if value?
      @value = _.clone(value)

    addEventListener 'keydown', @keyDown.bind(@)
    addEventListener 'keypress', @keyPress.bind(@)


  destroy: ->
    # removeEventListener 'keydown', @keyDownBound
    # removeEventListener 'keypress', @keyPressBound
    @terminal = null
    @history = []
    @_value = []
    @options = {}


  clear: ->
    @value = []
    return @


  isAtBegin: (x) -> (x || @_index) <= 0


  isAtEnd: (x) -> (x || @_index) >= @length - 1


  movePrevWord: ->
    i = @index - 1
    l = @length
    if @isAtEnd(i)
      i = l - 1
    if i > 0
      c = @value[i]
      while i > 0 and (!_.isString(c) or !/\w/.test(c))
        c = @value[--i]
    @moveTo(@wordAt(i).start)
    return @


  moveNextWord: ->
    i = @index + 1
    l = @length
    if @isAtEnd(i)
      i = l - 1
    if i < l
      c = @value[i]
      while i < l and (!_.isString(c) or !/\w/.test(c))
        c = @value[++i]
      i++
    @moveTo(@wordAt(i).end)
    return @


  moveLeft: (n = 1) -> @moveTo(Math.max(0, @index - n))


  moveRight: (n = 1) -> @moveTo(Math.min(@index + n, @length))


  moveToBegin: -> @moveTo(0)


  moveToEnd: -> @moveTo(@length)


  moveLeft: (n = 1) -> @moveBy(-n)


  moveRight: (n = 1) -> @moveBy(n)


  moveBy: (n) -> @moveTo(@_index + n)


  moveTo: (i) ->
    @_index = _.pinch(i, 0, @length)
    @cursor.moveTo(@_index, @cursor.y)
    return @


  adjustCursor: ->
    @moveTo(@_index)
    @cursor.scrollInView()
    return @


  # width: (start, end) ->
  #   w = 0
  #   str = ''
  #   for i in [start...end]
  #     c = @value[i]
  #     if _.isString(c)
  #       if c == ' '
  #         str += '<span>&nbsp;</span>'
  #       else
  #         str += c
  #     else if _.isElement(c)
  #       if str.length
  #         @_metric_el.innerHTML = str
  #         w += @_metric_el.offsetWidth
  #         str = ''
  #       w += c.offsetWidth
  #   if str.length
  #     @_metric_el.innerHTML = str
  #     w += @_metric_el.offsetWidth
  #   return w


  invalidate: ->
    @terminal.lines[@cursor.y].replace(@toString(true))


  insert: (index, value) ->
    if _.isString(value)
      a = value.split('')
    else if _.isArray(value)
      a = value
    @_value.splice(index, 0, a...)
    @invalidate()
    console.log index, value, a, @value
    @adjustCursor()
    return @


  delete: (start, end) ->
    if end > start
      [ start, end ] = [ end, start ]
    @value.splice(start, end - start)
    @invalidate()
    @adjustCursor()
    return @


  deleteBack: ->
    return @ if @isAtBegin()
    @moveLeft()
    @delete(@index, @index)


  deleteForward: ->
    return @ if @isAtEnd()
    @delete(@index, @index + 1)


  deleteWordBack: ->
    old = @index
    @moveToPrevWord()
    @delete(@index, old)


  deleteWordForward: ->
    old = @index
    @moveToNextWord()
    @delete(@index, old)


  keyDown: (e) ->
    if @_enabled
      console.log "keyDown", e, e.keyCode

      switch e.keyCode

        when 27
          @clear()

        when 37
          if e.metaKey
            @moveToBegin()
          else if e.altKey
            @movePrevWord()
          else
            @moveLeft()

        when 39
          if e.metaKey
            @moveToEnd()
          else if e.altKey
            @moveNextWord()
          else
            @moveRight()

        when 38
          if @history.length > 0
            @historyPtr = _.loop(@historyPtr - 1, 0, @history.length)
            @value = @history[@historyPtr]

        when 40
          if @history.length > 0
            @historyPtr = _.loop(@historyPtr + 1, 0, @history.length)
            @value = @history[@historyPtr]


  keyPress: (e) ->
    if @_enabled
      console.log "keyPress", e.keyCode, e.charCode, String.fromCharCode(e.charCode)

      switch e.keyCode

        when 13
          @addToHistory(@value)
          @execute()
          @clear()

        else
          if e.charCode?
            @insert(@_index, String.fromCharCode(e.charCode))
            @moveBy(1)


  addToHistory: (value) ->
    if !_.contains(@history, value)
      @history.push(value)
      @historyPtr = @history.length - 1
    return @


  undo: ->
    @commitTransaction()
    steps = @undoStack.pop()
    return unless steps
    @redoStack.push steps

    @noHistory = true
    for step in steps.slice().reverse()
      @value = step.oldValue

    if prev = @undoStack[@undoStack.length - 1]
      @moveTo(prev.index)

    @noHistory = false
    return @


  redo: ->
    steps = @redoStack.pop()
    return unless steps
    @undoStack.push steps

    @noHistory = true
    for step in steps.slice()
      @value = step.newValue
    @moveTo(steps.index)
    @noHistory = false
    return @


  commitTransaction: ->
    return unless @currentSteps.length
    @currentSteps.index = @index
    @undoStack.push(@currentSteps)
    @currentSteps = []
    return @


  wordAt: (index) ->
    l = @length

    index = _.pinch(index, 0, l)

    # Find start of word
    if index == 0
      start = 0
    else
      i = index
      c = @value[i]
      while i >= 0 and _.isString(c) and /\w/.test(c)
        c = @value[--i]
      start = i + 1

    # Find end of word
    if index >= l
      end = l
    else
      i = index
      c = @value[i]
      while i <= l and _.isString(c) and /\w/.test(c)
        c = @value[++i]
      end = i

    return { start: start, end: end }


  execute: ->
    @cursor.cr()
    @terminal.writeln("Results of #{@toString()}")
    if @terminal.inputExecuted?
      @terminal.inputExecuted(@toString())
    @stop()
    return @


  start: ->
    @_enabled = true
    @cursor.show()
    @cursor.startBlink()
    if @terminal.inputStarted?
      @terminal.inputStarted()


  stop: ->
    @_enabled = false
    @cursor.hide()
    if @terminal.inputEnded?
      @terminal.inputEnded()


  toString: (html = false) ->
    s = ''
    for n in @_value
      if _.isElement(n)
        s += if html then n.outerHTML else n.toString()
      else
        s += n
    return s


  toArray: ->
    _.clone(@_value)


  toParts: ->
    p = []
    word = ''
    for v in @value
      if _.isString(v)
        if v == ' '
          p.push(word) if word.length
          word = ''
        else
          word += v
      else if _.isElement(v)
        p.push(word) if word.length
        word = ''
    p.push(word) if word.length
    console.log p
    return p


  toHtml: ->
    s = ''
    for p in @toParts()
      if _.isString(p)
        s += "<span>#{p}</span>"
      else if _.isElement(p)
        s += p.outerHTML
      s += '<span>&nbsp;</span>'
    console.log s
    return s

