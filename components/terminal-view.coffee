{ BaseView } = TOS
{ div } = TOS.html

Terminal = require './butterfly/term'

TOS.TerminalView = class TerminalView extends BaseView

  _out: (data) ->
    # @write data
    # ws.send 'S' + data

  _ctl: (type, args...) ->
    # params = args.join(',')
    # if type == 'Resize'
      # ws.send 'R' + params

  startIcons: -> @attr([6,1])

  endIcons: -> @attr([6,0])

  resetAttr: -> @attr([0])

  created: ->
    super
    loadCSS './components/butterfly/term.css'

  attached: ->
    super
    @t = new Terminal(@_el, @_out, @_ctl)

    @__proto__.icons = @t.icons

    @__proto__.reset = @t.reset.bind(@t)
    @__proto__.ch = @t.ch.bind(@t)
    @__proto__.softReset = @t.softReset.bind(@t)
    @__proto__.putChar = @t.putChar.bind(@t)
    @__proto__.write = @t.write.bind(@t)
    @__proto__.writeln = @t.writeln.bind(@t)
    @__proto__.repeatPrecedingCharacter = @t.repeatPrecedingCharacter.bind(@t)
    @__proto__.box = @t.box.bind(@t)
    @__proto__.table = @t.table.bind(@t)
    @__proto__.center = @t.center.bind(@t)
    @__proto__.linewrap = @t.linewrap.bind(@t)

    @__proto__.success = @t.success.bind(@t)
    @__proto__.warning = @t.warning.bind(@t)
    @__proto__.error = @t.error.bind(@t)
    @__proto__.info = @t.info.bind(@t)

    @__proto__.blur = @t.blur.bind(@t)
    @__proto__.focus = @t.focus.bind(@t)
    @__proto__.refresh = @t.refresh.bind(@t)

    @__proto__.bell = @t.bell.bind(@t)

    @__proto__.framer = @t.framer.bind(@t)
    @__proto__.spinner = @t.spinner.bind(@t)

    @__proto__.cloneAttr = @t.cloneAttr.bind(@t)
    @__proto__.equalAttr = @t.equalAttr.bind(@t)
    @__proto__.eraseAttr = @t.eraseAttr.bind(@t)
    @__proto__.attr = @t.charAttributes.bind(@t)
    @__proto__.col = @t.color
    @__proto__.hasAnsi = @t.hasAnsi.bind(@t)
    @__proto__.stripAnsi = @t.stripAnsi.bind(@t)
    @__proto__.setAttrInRectangle = @t.setAttrInRectangle.bind(@t)
    @__proto__.reverseAttrInRectangle = @t.reverseAttrInRectangle.bind(@t)

    @__proto__.cursorCharAbsolute = @t.cursorCharAbsolute.bind(@t)
    @__proto__.charPosAbsolute = @t.charPosAbsolute.bind(@t)
    @__proto__.cursorPos = @t.cursorPos.bind(@t)
    @__proto__.HPositionRelative = @t.HPositionRelative.bind(@t)
    @__proto__.VPositionRelative = @t.VPositionRelative.bind(@t)
    @__proto__.linePosAbsolute = @t.linePosAbsolute.bind(@t)
    @__proto__.HVPosition = @t.HVPosition.bind(@t)

    @__proto__.cur = @t.cursor
    @__proto__.updateCursor = @t.updateCursor.bind(@t)
    @__proto__.setCursorStyle = @t.setCursorStyle.bind(@t)
    @__proto__.showCursor = @t.showCursor.bind(@t)
    @__proto__.startBlink = @t.startBlink.bind(@t)
    @__proto__.refreshBlink = @t.refreshBlink.bind(@t)
    @__proto__.nextLine = @t.nextLine.bind(@t)
    @__proto__.prevLine = @t.prevLine.bind(@t)
    @__proto__.cursorUp = @t.cursorUp.bind(@t)
    @__proto__.cursorDown = @t.cursorDown.bind(@t)
    @__proto__.cursorForward = @t.cursorForward.bind(@t)
    @__proto__.cursorBackward = @t.cursorBackward.bind(@t)
    @__proto__.cursorNextLine = @t.cursorNextLine.bind(@t)
    @__proto__.cursorPrecedingLine = @t.cursorPrecedingLine.bind(@t)
    @__proto__.cursorForwardTab = @t.cursorForwardTab.bind(@t)
    @__proto__.cursorBackwardTab = @t.cursorBackwardTab.bind(@t)
    @__proto__.saveCursor = @t.saveCursor.bind(@t)
    @__proto__.restoreCursor = @t.restoreCursor.bind(@t)
    @__proto__.enableLocatorReporting = @t.enableLocatorReporting.bind(@t)
    @__proto__.setLocatorEvents = @t.setLocatorEvents.bind(@t)
    @__proto__.requestLocatorPosition = @t.requestLocatorPosition.bind(@t)

    @__proto__.tabSet = @t.tabSet.bind(@t)
    @__proto__.tabClear = @t.tabClear.bind(@t)
    @__proto__.setupStops = @t.setupStops.bind(@t)
    @__proto__.prevStop = @t.prevStop.bind(@t)
    @__proto__.nextStop = @t.nextStop.bind(@t)

    @__proto__.eraseRight = @t.eraseRight.bind(@t)
    @__proto__.eraseLeft = @t.eraseLeft.bind(@t)
    @__proto__.eraseLine = @t.eraseLine.bind(@t)
    @__proto__.blankLine = @t.blankLine.bind(@t)
    @__proto__.eraseInDisplay = @t.eraseInDisplay.bind(@t)
    @__proto__.eraseInLine = @t.eraseInLine.bind(@t)
    @__proto__.deleteLines = @t.deleteLines.bind(@t)
    @__proto__.deleteChars = @t.deleteChars.bind(@t)
    @__proto__.eraseChars = @t.eraseChars.bind(@t)

    @__proto__.insertChars = @t.insertChars.bind(@t)
    @__proto__.insertLines = @t.insertLines.bind(@t)

    @__proto__.insertColumns = @t.insertColumns.bind(@t)
    @__proto__.deleteColumns = @t.deleteColumns.bind(@t)

    @__proto__.setScrollRegion = @t.setScrollRegion.bind(@t)
    @__proto__.scrollUp = @t.scrollUp.bind(@t)
    @__proto__.scrollDown = @t.scrollDown.bind(@t)
    @__proto__.scrollTo = @t.scroll.bind(@t)
    @__proto__.unscroll = @t.unscroll.bind(@t)
    @__proto__.nativeScrollTo = @t.nativeScrollTo.bind(@t)
    @__proto__.scrollDisplay = @t.scrollDisplay.bind(@t)

    @__proto__.copyRectangle = @t.copyRectangle.bind(@t)
    @__proto__.enableFilterRectangle = @t.enableFilterRectangle.bind(@t)
    @__proto__.fillRectangle = @t.fillRectangle.bind(@t)
    @__proto__.eraseRectangle = @t.eraseRectangle.bind(@t)
    @__proto__.selectiveEraseRectangle = @t.selectiveEraseRectangle.bind(@t)

    @col.enabled = true

TerminalView.register()
