(function() {
  var BaseView, CustomEvent, TextBuffer, TextCursor, TextCursorView, TextPoint, TextRegion, div, ref, ref1, span, textarea,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView, CustomEvent = TOS.CustomEvent;

  ref = TOS.html, textarea = ref.textarea, div = ref.div, span = ref.span;

  ref1 = require('./text/textbuffer'), TextBuffer = ref1.TextBuffer, TextPoint = ref1.TextPoint, TextRegion = ref1.TextRegion;

  TextCursor = require('./text/textcursor').TextCursor;

  TOS.TextCursorView = TextCursorView = (function(superClass) {
    extend(TextCursorView, superClass);

    function TextCursorView() {
      return TextCursorView.__super__.constructor.apply(this, arguments);
    }

    TextCursorView.prototype.css = {
      ':host': {
        'display': 'block',
        'position': 'absolute',
        'background-color': 'black'
      }
    };

    TextCursorView.prototype.accessor('parentView', function() {
      return this.parentNode.parentNode;
    });

    TextCursorView.prototype.accessor('_buffer', function() {
      return this.parentView._buffer;
    });

    TextCursorView.prototype.accessor('charWidth', function() {
      return this.parentView.charSize.width;
    });

    TextCursorView.prototype.accessor('charHeight', function() {
      return this.parentView.charSize.height;
    });

    TextCursorView.prototype.attached = function() {
      TextCursorView.__super__.attached.apply(this, arguments);
      this._cursor = new TextCursor(this._buffer, 0, 0);
      this.style.width = this.charWidth + 'px';
      this.style.height = this.charHeight + 'px';
      return this._blinker = setInterval((function(_this) {
        return function() {
          return _this.toggleAttr('hidden');
        };
      })(this), this.attr('cursorBlinkRate'));
    };

    TextCursorView.prototype.detached = function() {
      TextCursorView.__super__.detached.apply(this, arguments);
      return clearInterval(this._blinker);
    };

    TextCursorView.prototype.render = function() {
      return div('.edit-cursor-view');
    };

    TextCursorView.prototype.moveTo = function(x, y) {
      this._cursor.moveTo(y, x);
      this._pos = {
        x: x,
        y: y
      };
      this.style.left = x * this.charWidth + 'px';
      return this.style.top = y * this.charHeight + 'px';
    };

    TextCursorView.prototype.moveBy = function(x, y) {
      return this.moveTo(this._pos.x + x, this._pos.y + y);
    };

    TextCursorView.prototype.home = function() {
      return this.moveTo(0, 0);
    };

    TextCursorView.prototype.end = function() {
      return this.moveTo(this.parentView._size.width - 1, this.parentView._size.height - 1);
    };

    TextCursorView.prototype.bol = function() {
      return this.moveTo(0, this._pos.y);
    };

    TextCursorView.prototype.eol = function() {
      return this.moveTo(this.parentView._size.width - 1, this._pos.y);
    };

    TextCursorView.prototype.cr = function() {
      return this.down().bol();
    };

    TextCursorView.prototype.lf = function() {
      return this.down();
    };

    TextCursorView.prototype.bs = function() {
      return this.left();
    };

    TextCursorView.prototype.del = function() {
      return this.parentView.eraseAt(this._pos);
    };

    TextCursorView.prototype.tab = function() {
      return this.moveBy(2, 0);
    };

    TextCursorView.prototype.isBol = function() {
      return this._pos.x === 0;
    };

    TextCursorView.prototype.isEol = function() {
      return this._pos.x === this.parentView._size.width - 1;
    };

    TextCursorView.prototype.isHome = function() {
      return this.isBol() && this._pos.y === 0;
    };

    TextCursorView.prototype.isEnd = function() {
      return this.isEol() && this._pos.y === this.parentView._size.height - 1;
    };

    TextCursorView.prototype.left = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(-count, 0);
      return this;
    };

    TextCursorView.prototype.right = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(count, 0);
      return this;
    };

    TextCursorView.prototype.up = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, -count);
      return this;
    };

    TextCursorView.prototype.down = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, count);
      return this;
    };

    return TextCursorView;

  })(BaseView);

  TextCursorView.register();

}).call(this);
