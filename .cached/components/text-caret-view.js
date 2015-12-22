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

    TextCaretView.prototype.attrs = {
      caretBlinkRate: 500,
      caretExtraWidth: 0,
      caretExtraHeight: 0
    };

    TextCaretView.prototype.accessor('parentView', function() {
      return this.parentNode.parentNode;
    });

    TextCaretView.prototype.accessor('_buffer', function() {
      return this.parentView._buffer;
    });

    TextCaretView.prototype.accessor('charWidth', function() {
      return this.parentView.charSize.width;
    });

    TextCaretView.prototype.accessor('charHeight', function() {
      return this.parentView.charSize.height;
    });

    TextCaretView.prototype.ready = function() {
      return this.pos = {
        x: 0,
        y: 0
      };
    };

    TextCaretView.prototype.attached = function() {
      TextCaretView.__super__.attached.apply(this, arguments);
      this.cursor = new TextCursor(this._buffer, 0, 0);
      this._updateCaret();
      if (this.attr('caretBlinkRate' !== 0)) {
        return this._blinker = setInterval((function(_this) {
          return function() {
            return _this.toggleAttr('hidden');
          };
        })(this), this.attr('caretBlinkRate'));
      }
    };

    TextCaretView.prototype._updateCaret = function() {
      this.style.width = this.charWidth + this.caretExtraWidth + 'px';
      this.style.height = this.charHeight(this.caretExtraHeight + 'px');
      this.style.left = this.pos.x * this.charWidth + 'px';
      return this.style.top = this.pos.y * this.charHeight + 'px';
    };

    TextCaretView.prototype.caretExtraWidthChanged = function() {
      return this._updateCaret();
    };

    TextCaretView.prototype.caretExtraHeightChanged = function() {
      return this._updateCaret();
    };

    TextCaretView.prototype.detached = function() {
      TextCaretView.__super__.detached.apply(this, arguments);
      return clearInterval(this._blinker);
    };

    TextCaretView.prototype.render = function() {
      return div('.text-caret-view');
    };

    TextCaretView.prototype.moveTo = function(x, y) {
      if (x instanceof TextPoint) {
        y = x.row;
        x = x.col;
      }
      this.cursor.moveTo(y, x);
      this.pos = {
        x: x,
        y: y
      };
      return this._updateCaret();
    };

    TextCaretView.prototype.moveBy = function(x, y) {
      if (x instanceof TextPoint) {
        y = x.row;
        x = x.col;
      }
      return this.moveTo(this.pos.x + x, this.pos.y + y);
    };

    TextCaretView.prototype.home = function() {
      return this.moveTo(0, 0);
    };

    TextCaretView.prototype.end = function() {
      return this.moveTo(this.parentView._size.width - 1, this.parentView._size.height - 1);
    };

    TextCaretView.prototype.bol = function() {
      return this.moveTo(0, this.pos.y);
    };

    TextCaretView.prototype.eol = function() {
      return this.moveTo(this.parentView._size.width - 1, this.pos.y);
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

    TextCaretView.prototype.del = function() {
      return this.parentView.eraseAt(this.pos);
    };

    TextCaretView.prototype.tab = function() {
      return this.moveBy(2, 0);
    };

    TextCaretView.prototype.isBol = function() {
      return this.pos.x === 0;
    };

    TextCaretView.prototype.isEol = function() {
      return this.pos.x === this.parentView._size.width - 1;
    };

    TextCaretView.prototype.isHome = function() {
      return this.isBol() && this.pos.y === 0;
    };

    TextCaretView.prototype.isEnd = function() {
      return this.isEol() && this.pos.y === this.parentView._size.height - 1;
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
