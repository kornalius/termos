(function() {
  var BaseView, Terminal, TerminalView, div,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    slice = [].slice;

  BaseView = TOS.BaseView;

  div = TOS.html.div;

  Terminal = require('./butterfly/term');

  TOS.TerminalView = TerminalView = (function(superClass) {
    extend(TerminalView, superClass);

    function TerminalView() {
      return TerminalView.__super__.constructor.apply(this, arguments);
    }

    TerminalView.prototype._out = function(data) {};

    TerminalView.prototype._ctl = function() {
      var args, type;
      type = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    };

    TerminalView.prototype.startIcons = function() {
      return this.attr([6, 1]);
    };

    TerminalView.prototype.endIcons = function() {
      return this.attr([6, 0]);
    };

    TerminalView.prototype.resetAttr = function() {
      return this.attr([0]);
    };

    TerminalView.prototype.created = function() {
      TerminalView.__super__.created.apply(this, arguments);
      return loadCSS('./components/butterfly/term.css');
    };

    TerminalView.prototype.attached = function() {
      TerminalView.__super__.attached.apply(this, arguments);
      this.t = new Terminal(this._el, this._out, this._ctl);
      this.__proto__.icons = this.t.icons;
      this.__proto__.reset = this.t.reset.bind(this.t);
      this.__proto__.ch = this.t.ch.bind(this.t);
      this.__proto__.softReset = this.t.softReset.bind(this.t);
      this.__proto__.putChar = this.t.putChar.bind(this.t);
      this.__proto__.write = this.t.write.bind(this.t);
      this.__proto__.writeln = this.t.writeln.bind(this.t);
      this.__proto__.repeatPrecedingCharacter = this.t.repeatPrecedingCharacter.bind(this.t);
      this.__proto__.box = this.t.box.bind(this.t);
      this.__proto__.table = this.t.table.bind(this.t);
      this.__proto__.center = this.t.center.bind(this.t);
      this.__proto__.linewrap = this.t.linewrap.bind(this.t);
      this.__proto__.success = this.t.success.bind(this.t);
      this.__proto__.warning = this.t.warning.bind(this.t);
      this.__proto__.error = this.t.error.bind(this.t);
      this.__proto__.info = this.t.info.bind(this.t);
      this.__proto__.blur = this.t.blur.bind(this.t);
      this.__proto__.focus = this.t.focus.bind(this.t);
      this.__proto__.refresh = this.t.refresh.bind(this.t);
      this.__proto__.bell = this.t.bell.bind(this.t);
      this.__proto__.framer = this.t.framer.bind(this.t);
      this.__proto__.spinner = this.t.spinner.bind(this.t);
      this.__proto__.cloneAttr = this.t.cloneAttr.bind(this.t);
      this.__proto__.equalAttr = this.t.equalAttr.bind(this.t);
      this.__proto__.eraseAttr = this.t.eraseAttr.bind(this.t);
      this.__proto__.attr = this.t.charAttributes.bind(this.t);
      this.__proto__.col = this.t.color;
      this.__proto__.hasAnsi = this.t.hasAnsi.bind(this.t);
      this.__proto__.stripAnsi = this.t.stripAnsi.bind(this.t);
      this.__proto__.setAttrInRectangle = this.t.setAttrInRectangle.bind(this.t);
      this.__proto__.reverseAttrInRectangle = this.t.reverseAttrInRectangle.bind(this.t);
      this.__proto__.cursorCharAbsolute = this.t.cursorCharAbsolute.bind(this.t);
      this.__proto__.charPosAbsolute = this.t.charPosAbsolute.bind(this.t);
      this.__proto__.cursorPos = this.t.cursorPos.bind(this.t);
      this.__proto__.HPositionRelative = this.t.HPositionRelative.bind(this.t);
      this.__proto__.VPositionRelative = this.t.VPositionRelative.bind(this.t);
      this.__proto__.linePosAbsolute = this.t.linePosAbsolute.bind(this.t);
      this.__proto__.HVPosition = this.t.HVPosition.bind(this.t);
      this.__proto__.cur = this.t.cursor;
      this.__proto__.updateCursor = this.t.updateCursor.bind(this.t);
      this.__proto__.setCursorStyle = this.t.setCursorStyle.bind(this.t);
      this.__proto__.showCursor = this.t.showCursor.bind(this.t);
      this.__proto__.startBlink = this.t.startBlink.bind(this.t);
      this.__proto__.refreshBlink = this.t.refreshBlink.bind(this.t);
      this.__proto__.nextLine = this.t.nextLine.bind(this.t);
      this.__proto__.prevLine = this.t.prevLine.bind(this.t);
      this.__proto__.cursorUp = this.t.cursorUp.bind(this.t);
      this.__proto__.cursorDown = this.t.cursorDown.bind(this.t);
      this.__proto__.cursorForward = this.t.cursorForward.bind(this.t);
      this.__proto__.cursorBackward = this.t.cursorBackward.bind(this.t);
      this.__proto__.cursorNextLine = this.t.cursorNextLine.bind(this.t);
      this.__proto__.cursorPrecedingLine = this.t.cursorPrecedingLine.bind(this.t);
      this.__proto__.cursorForwardTab = this.t.cursorForwardTab.bind(this.t);
      this.__proto__.cursorBackwardTab = this.t.cursorBackwardTab.bind(this.t);
      this.__proto__.saveCursor = this.t.saveCursor.bind(this.t);
      this.__proto__.restoreCursor = this.t.restoreCursor.bind(this.t);
      this.__proto__.enableLocatorReporting = this.t.enableLocatorReporting.bind(this.t);
      this.__proto__.setLocatorEvents = this.t.setLocatorEvents.bind(this.t);
      this.__proto__.requestLocatorPosition = this.t.requestLocatorPosition.bind(this.t);
      this.__proto__.tabSet = this.t.tabSet.bind(this.t);
      this.__proto__.tabClear = this.t.tabClear.bind(this.t);
      this.__proto__.setupStops = this.t.setupStops.bind(this.t);
      this.__proto__.prevStop = this.t.prevStop.bind(this.t);
      this.__proto__.nextStop = this.t.nextStop.bind(this.t);
      this.__proto__.eraseRight = this.t.eraseRight.bind(this.t);
      this.__proto__.eraseLeft = this.t.eraseLeft.bind(this.t);
      this.__proto__.eraseLine = this.t.eraseLine.bind(this.t);
      this.__proto__.blankLine = this.t.blankLine.bind(this.t);
      this.__proto__.eraseInDisplay = this.t.eraseInDisplay.bind(this.t);
      this.__proto__.eraseInLine = this.t.eraseInLine.bind(this.t);
      this.__proto__.deleteLines = this.t.deleteLines.bind(this.t);
      this.__proto__.deleteChars = this.t.deleteChars.bind(this.t);
      this.__proto__.eraseChars = this.t.eraseChars.bind(this.t);
      this.__proto__.insertChars = this.t.insertChars.bind(this.t);
      this.__proto__.insertLines = this.t.insertLines.bind(this.t);
      this.__proto__.insertColumns = this.t.insertColumns.bind(this.t);
      this.__proto__.deleteColumns = this.t.deleteColumns.bind(this.t);
      this.__proto__.setScrollRegion = this.t.setScrollRegion.bind(this.t);
      this.__proto__.scrollUp = this.t.scrollUp.bind(this.t);
      this.__proto__.scrollDown = this.t.scrollDown.bind(this.t);
      this.__proto__.scrollTo = this.t.scroll.bind(this.t);
      this.__proto__.unscroll = this.t.unscroll.bind(this.t);
      this.__proto__.nativeScrollTo = this.t.nativeScrollTo.bind(this.t);
      this.__proto__.scrollDisplay = this.t.scrollDisplay.bind(this.t);
      this.__proto__.copyRectangle = this.t.copyRectangle.bind(this.t);
      this.__proto__.enableFilterRectangle = this.t.enableFilterRectangle.bind(this.t);
      this.__proto__.fillRectangle = this.t.fillRectangle.bind(this.t);
      this.__proto__.eraseRectangle = this.t.eraseRectangle.bind(this.t);
      this.__proto__.selectiveEraseRectangle = this.t.selectiveEraseRectangle.bind(this.t);
      return this.col.enabled = true;
    };

    return TerminalView;

  })(BaseView);

  TerminalView.register();

}).call(this);
