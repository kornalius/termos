(function() {
  var BaseView, CustomEvent, TextBuffer, TextCaretView, TextCursor, TextPoint, TextRegion, div, ref, ref1, span, textarea,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView, CustomEvent = TOS.CustomEvent;

  ref = TOS.html, textarea = ref.textarea, div = ref.div, span = ref.span;

  ref1 = require('./text/textbuffer'), TextBuffer = ref1.TextBuffer, TextPoint = ref1.TextPoint, TextRegion = ref1.TextRegion;

  TextCursor = require('./text/textcursor').TextCursor;

  TOS.TextCaretView = TextCaretView = (function(superClass) {
    extend(TextCaretView, superClass);

    function TextCaretView() {
      return TextCaretView.__super__.constructor.apply(this, arguments);
    }

    TextCaretView.prototype.css = {
      ':host': {
        'display': 'block',
        'position': 'absolute',
        'background-color': 'black'
      }
    };

    TextCaretView.prototype.props = {
      caretBlinkRate: 500,
      caretExtraWidth: 0,
      caretExtraHeight: 0,
      textCursor: null
    };

    TextCaretView.prototype.attrs = {
      row: 0,
      col: 0
    };

    TextCaretView.prototype.accessor('parentView', function() {
      var ref2;
      return (ref2 = this.parentNode) != null ? ref2.parentNode : void 0;
    });

    TextCaretView.prototype.accessor('_buffer', function() {
      var ref2;
      return (ref2 = this.parentView) != null ? ref2._buffer : void 0;
    });

    TextCaretView.prototype.accessor('charWidth', function() {
      if (this.parentView != null) {
        return this.parentView.charSize.width;
      } else {
        return 0;
      }
    });

    TextCaretView.prototype.accessor('charHeight', function() {
      if (this.parentView != null) {
        return this.parentView.charSize.height;
      } else {
        return 0;
      }
    });

    TextCaretView.prototype.accessor('row', function() {
      if (this.parentView != null) {
        return this.parentView.cursorToTextPoint(this.textCursor).row;
      } else {
        return 0;
      }
    });

    TextCaretView.prototype.accessor('col', function() {
      if (this.parentView != null) {
        return this.parentView.cursorToTextPoint(this.textCursor).col;
      } else {
        return 0;
      }
    });

    TextCaretView.prototype.attached = function() {
      TextCaretView.__super__.attached.apply(this, arguments);
      return this.updateCaret();
    };

    TextCaretView.prototype.updateCaret = function() {
      if (this.parentView != null) {
        this.style.width = this.charWidth + this.caretExtraWidth + 'px';
        this.style.height = this.charHeight + this.caretExtraHeight + 'px';
        this.style.left = this.col * this.charWidth + 'px';
        return this.style.top = this.row * this.charHeight + 'px';
      }
    };

    TextCaretView.prototype.textCursorChanged = function(textCursor) {
      textCursor.caret = this;
      return this.updateCaret();
    };

    TextCaretView.prototype.rowChanged = function(row) {
      this.row = row;
      return this.updateCaret();
    };

    TextCaretView.prototype.colChanged = function(col) {
      this.col = col;
      return this.updateCaret();
    };

    TextCaretView.prototype.caretExtraWidthChanged = function() {
      return this.updateCaret();
    };

    TextCaretView.prototype.caretExtraHeightChanged = function() {
      return this.updateCaret();
    };

    TextCaretView.prototype.detached = function() {
      TextCaretView.__super__.detached.apply(this, arguments);
      return clearInterval(this._blinker);
    };

    TextCaretView.prototype.moveTo = function(row, col) {
      if (row instanceof TextPoint) {
        col = row.row;
        row = row.col;
      }
      return this.textCursor.moveTo(row, col);
    };

    TextCaretView.prototype.moveBy = function(row, col) {
      if (row instanceof TextPoint) {
        col = row.row;
        row = row.col;
      }
      return this.moveTo(this.row + col, this.col + row);
    };

    TextCaretView.prototype.home = function() {
      return this.moveTo(0, 0);
    };

    TextCaretView.prototype.end = function() {
      return this.moveTo(this.parentView._size.width - 1, this.parentView._size.height - 1);
    };

    TextCaretView.prototype.bol = function() {
      return this.moveTo(0, this.row);
    };

    TextCaretView.prototype.eol = function() {
      return this.moveTo(this.parentView._size.width - 1, this.row);
    };

    TextCaretView.prototype.cr = function() {
      return this.down().bol();
    };

    TextCaretView.prototype.lf = function() {
      return this.down();
    };

    TextCaretView.prototype.bs = function() {
      return this.left();
    };

    TextCaretView.prototype.tab = function() {
      return this.moveBy(2, 0);
    };

    TextCaretView.prototype.isBol = function() {
      return this.col === 0;
    };

    TextCaretView.prototype.isEol = function() {
      return this.col === this.parentView._size.width - 1;
    };

    TextCaretView.prototype.isHome = function() {
      return this.isBol() && this.row === 0;
    };

    TextCaretView.prototype.isEnd = function() {
      return this.isEol() && this.row === this.parentView._size.height - 1;
    };

    TextCaretView.prototype.left = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(-count, 0);
      return this;
    };

    TextCaretView.prototype.right = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(count, 0);
      return this;
    };

    TextCaretView.prototype.up = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, -count);
      return this;
    };

    TextCaretView.prototype.down = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, count);
      return this;
    };

    return TextCaretView;

  })(BaseView);

  TextCaretView.register();

}).call(this);
