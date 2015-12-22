(function() {
  var BaseView, CustomEvent, TextBuffer, TextCaretView, TextCursor, TextEditView, TextPoint, TextRegion, div, ref, ref1, span, textarea,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView, CustomEvent = TOS.CustomEvent;

  ref = TOS.html, textarea = ref.textarea, div = ref.div, span = ref.span, TextCaretView = ref.TextCaretView;

  ref1 = require('./text/textbuffer'), TextBuffer = ref1.TextBuffer, TextPoint = ref1.TextPoint, TextRegion = ref1.TextRegion;

  TextCursor = require('./text/textcursor').TextCursor;

  TOS.TextEditView = TextEditView = (function(superClass) {
    extend(TextEditView, superClass);

    function TextEditView() {
      this.onDblClick = bind(this.onDblClick, this);
      this.onUp = bind(this.onUp, this);
      this.onMove = bind(this.onMove, this);
      this.onDown = bind(this.onDown, this);
      return TextEditView.__super__.constructor.apply(this, arguments);
    }

    TextEditView.prototype.css = {
      '@font-face': {
        'font-family': 'SourceCodePro',
        'src': "url('./fonts/SourceCodePro-ExtraLight.otf') format('woff')",
        'font-weight': 100
      },
      ':host': {
        'display': 'block',
        'height': '200px',
        'border': '1px solid black',
        'font-family': 'SourceCodePro, monospace'
      }
    };

    TextEditView.prototype.attrs = {
      caretBlinkRate: 500,
      caretExtraWidth: 0,
      caretExtraHeight: 0
    };

    TextEditView.prototype.accessor('caret', function() {
      if (this.carets.length === 0) {
        return this.addCaret();
      } else {
        return this.carets[0];
      }
    });

    TextEditView.prototype.textChanged = function(value) {
      return this.async(function() {
        if ((value != null) && (this._buffer != null) && this._buffer.text() !== value) {
          this._buffer.setText(value);
          this.setCaret();
          return this.invalidate();
        }
      });
    };

    TextEditView.prototype.computeCharSize = function() {
      var r, testSpan;
      testSpan = document.createElement('span');
      testSpan.textContent = '0123456789';
      this.appendChild(testSpan);
      r = testSpan.getBoundingClientRect();
      this.charSize = {
        width: r.width / 10,
        height: r.height
      };
      testSpan.remove();
      r = this.getBoundingClientRect();
      this._size = {
        width: Math.round(r.width / this.charSize.width),
        height: Math.round(r.height / this.charSize.height)
      };
      return this._contentSize = this._size;
    };

    TextEditView.prototype.created = function() {
      TextEditView.__super__.created.apply(this, arguments);
      this.carets = [];
      this._viewport = {
        x: 0,
        y: 0
      };
      return this.tabIndex = 0;
    };

    TextEditView.prototype.attached = function() {
      TextEditView.__super__.attached.apply(this, arguments);
      if (this.parentNode != null) {
        this._buffer = new TextBuffer(this, '');
        this.computeCharSize();
        this.setCaret();
        this._buffer.on('line:change', (function(_this) {
          return function(row) {
            _this.scrollInView();
            return _this.invalidate();
          };
        })(this));
        this._buffer.on('line:insert', (function(_this) {
          return function(row) {
            _this.scrollInView();
            return _this.invalidate();
          };
        })(this));
        this._buffer.on('line:delete', (function(_this) {
          return function(row) {
            _this.scrollInView();
            return _this.invalidate();
          };
        })(this));
        this._buffer.on('reset', (function(_this) {
          return function() {
            _this.scrollInView();
            return _this.invalidate();
          };
        })(this));
        this.key(['mod+c', 'mod+x', 'mod+v', 'mod+z', 'mod+shift+z'], (function(_this) {
          return function(e) {
            return e.preventDefault();
          };
        })(this));
        this.key(['space'].concat("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()[]{}\\|\'\";:,<.>/?-=_+".split('')), (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            console.log(_this, e);
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.insert(String.fromCharCode(e.which));
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('backspace', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.deleteBack();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+backspace', 'alt+backspace'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.deleteWordBack();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key('del', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.deleteForward();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+del', 'alt+del'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.deleteWordForward();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key('left', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveLeft();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('right', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveRight();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('up', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveUp();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('down', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveDown();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+left', 'alt+left'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveToPrevWord();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+right', 'alt+right'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveToNextWord();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['home', 'command+left'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveToLineBegin();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['end', 'command+right'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.carets;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.cursor.moveToLineEnd();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        return this.key('a b c', (function(_this) {
          return function(e) {
            console.log('a b c pressed in sequence');
            return e.stopPropagation();
          };
        })(this));
      }
    };

    TextEditView.prototype.render = function(content) {
      var l;
      return div('.edit-view', [
        (function() {
          var i, len, ref2, results;
          if (this._buffer != null) {
            ref2 = this._buffer.lines;
            results = [];
            for (i = 0, len = ref2.length; i < len; i++) {
              l = ref2[i];
              results.push(div([span(l)]));
            }
            return results;
          }
        }).call(this)
      ]);
    };

    TextEditView.prototype.pixelToTextPoint = function(pixel) {
      return this.textPoint(Math.trunc(pixel.y / this.charSize.height), Math.trunc(pixel.x / this.charSize.width));
    };

    TextEditView.prototype.pixelToViewPoint = function(pixel) {
      return this.textPointToViewPoint(this.pixelToTextPoint(pixel));
    };

    TextEditView.prototype.textPointToPixel = function(point) {
      return {
        x: Math.ceil(point.col * this.charSize.width),
        y: Math.ceil(point.row * this.charSize.height)
      };
    };

    TextEditView.prototype.viewPointToPixel = function(point) {
      return this.textPointToPixel(this.viewPointToTextPoint(point));
    };

    TextEditView.prototype.textPointToViewPoint = function(point) {
      return {
        x: point.col - this._viewport.x,
        y: point.row - this._viewport.y
      };
    };

    TextEditView.prototype.viewPointToTextPoint = function(viewpoint) {
      return this.textPoint(viewpoint.y + this._viewport.y, viewpoint.x + this._viewport.x);
    };

    TextEditView.prototype.viewPointToIndex = function(viewpoint) {
      return this.textPointToIndex(this.viewPointToTextPoint(viewpoint));
    };

    TextEditView.prototype.textPointToIndex = function(point) {
      var l;
      if (point.row < this._buffer.lineCount()) {
        l = this._buffer.text(point.row);
      } else {
        l = null;
      }
      if (l != null) {
        return point.row * this._size.width + point.col;
      } else {
        return -1;
      }
    };

    TextEditView.prototype.indexToTextPoint = function(index) {
      var i, l, len, prevx, ref2, x, y;
      x = 0;
      y = 0;
      ref2 = this._buffer.lines;
      for (i = 0, len = ref2.length; i < len; i++) {
        l = ref2[i];
        prevx = x;
        x += l.length;
        if (x > index) {
          return this.textPoint(y, index - x);
        }
        y++;
      }
      return null;
    };

    TextEditView.prototype.maxLineWidth = function() {
      var i, l, len, m, ref2;
      m = 0;
      if (this._buffer != null) {
        ref2 = this._buffer.lines;
        for (i = 0, len = ref2.length; i < len; i++) {
          l = ref2[i];
          if (l.length > m) {
            m = l.length;
          }
        }
      }
      return m;
    };

    TextEditView.prototype.textPoint = function(row, col) {
      if (_.isNumber(row) && _.isNumber(col)) {
        return new TextPoint(this._buffer, row, col);
      } else if (row instanceof TextPoint) {
        return row.clone();
      } else if (_.isNumber(row)) {
        return this.indexToTextPoint(row);
      } else {
        return new TextPoint(this._buffer, 0, 0);
      }
    };

    TextEditView.prototype.textRegion = function(row, col, row2, col2) {
      if (_.isNumber(row) && _.isNumber(col) && _.isNumber(row2) && _.isNumber(col2)) {
        return new TextRegion(this.textPoint(row, col), this.textPoint(row2, col2));
      } else if (_.isNumber(row) && _.isNumber(col)) {
        return new TextRegion(this.textPoint(row, col), this.textPoint(row, col));
      } else if (row instanceof TextRegion) {
        return new TextRegion(row.begin.clone(), row.end.clone());
      } else if (row instanceof TextPoint && col instanceof TextPoint) {
        return new TextRegion(row.clone(), col.clone());
      } else if (row instanceof TextPoint) {
        return new TextRegion(row.clone(), row.clone());
      } else {
        return new TextRegion(this.textPoint(), this.textPoint());
      }
    };

    TextEditView.prototype.textRegionContains = function(region, point, rect) {
      var begin, end, r;
      if (rect == null) {
        rect = false;
      }
      r = region.ordered();
      if (rect) {
        return point.row >= r.begin.row && point.row <= r.end.row && point.col >= r.begin.col && point.col <= r.end.col;
      } else {
        point = this.textPointToIndex(point);
        begin = this.textPointToIndex(r.begin);
        end = this.textPointToIndex(r.end) - 1;
        return point >= begin && point <= end;
      }
    };

    TextEditView.prototype.caretToTextPoint = function(caret) {
      if (caret.cursor.region != null) {
        return caret.cursor.region.end;
      } else if (caret.cursor.point != null) {
        return caret.cursor.point;
      } else {
        return this.textPoint();
      }
    };

    TextEditView.prototype.caretRegion = function(caret) {
      if (caret.cursor.region != null) {
        return caret.cursor.region;
      } else if (caret.cursor.point != null) {
        return this.textRegion(caret.cursor.point);
      } else {
        return this.textRegion();
      }
    };

    TextEditView.prototype.setCaret = function(caret, point) {
      if (!(caret instanceof TextCaretView)) {
        point = caret;
        caret = null;
      }
      if (caret == null) {
        caret = this.caret;
      }
      if (point == null) {
        point = this.textPoint();
      }
      if (this.isValidTextPoint(point)) {
        caret.moveTo(point);
      }
      return caret;
    };

    TextEditView.prototype.addCaret = function(point) {
      var caret;
      if (point == null) {
        point = {
          x: 0,
          y: 0
        };
      }
      caret = null;
      if (this.isValidTextPoint(point)) {
        caret = document.createElement('text-caret-view', {
          caretBlinkRate: this.attr('caretBlinkRate', {
            caretExtraWidth: this.attr('caretExtraWidth', {
              caretExtraHeight: this.attr('caretExtraHeight')
            })
          })
        });
        caret.moveTo(point);
        this.carets.push(caret);
        caret.on('move', (function(_this) {
          return function() {
            _this.emit('text.caret.view.move', {
              target: caret
            });
            return _this.scrollInView();
          };
        })(this));
      }
      return caret;
    };

    TextEditView.prototype.removeCaret = function(caret) {
      var point;
      if (!(caret instanceof TextCaretView)) {
        point = caret;
        caret = null;
      }
      if ((caret != null) && caret !== this.caret) {
        _.remove(this.carets, caret);
      }
      return this;
    };

    TextEditView.prototype.moveCaret = function(caret, point) {
      if (!(caret instanceof TextCaretView)) {
        point = caret;
        caret = null;
      }
      if (caret == null) {
        caret = this.caret;
      }
      if (this.isValidTextPoint(point)) {
        caret.moveTo(point);
      }
      return this;
    };

    TextEditView.prototype.select = function(caret, region) {
      if (!(caret instanceof TextCaretView)) {
        region = caret;
        caret = null;
      }
      if (caret == null) {
        caret = this.caret;
      }
      if (this.isValidTextPoint(region.begin) && this.isValidTextPoint(region.end)) {
        caret.select(this.textRegion(region));
      }
      return this;
    };

    TextEditView.prototype.caretAt = function(point, regionOnly) {
      var c, i, len, ref2;
      if (regionOnly == null) {
        regionOnly = false;
      }
      ref2 = this.carets;
      for (i = 0, len = ref2.length; i < len; i++) {
        c = ref2[i];
        if ((c.cursor.point != null) && c.cursor.point.col === point.col && c.cursor.point.row === point.row && !regionOnly) {
          return c;
        } else if ((c.cursor.region != null) && this.textRegionContains(c.cursor.region, point)) {
          return c;
        }
      }
      return null;
    };

    TextEditView.prototype.caretAtPixel = function(pixel) {
      return this.caretAt(this.pixelToTextPoint(pixel));
    };

    TextEditView.prototype.isValidTextPoint = function(point) {
      return (this._contentSize.width === 0 && this._contentSize.height === 0) || (point.col >= 0 && point.col < this._contentSize.width && point.row >= 0 && point.row < this._contentSize.height);
    };

    TextEditView.prototype.scrollBy = function(pos) {
      var c, i, len, ref2;
      ref2 = this.carets;
      for (i = 0, len = ref2.length; i < len; i++) {
        c = ref2[i];
        c.cursor.moveTo(this.fromTextPoint(this.caretToTextPoint(tc)));
      }
      this.invalidate();
      return this;
    };

    TextEditView.prototype.scrollInView = function(point, hcenter, vcenter) {
      if (hcenter == null) {
        hcenter = false;
      }
      if (vcenter == null) {
        vcenter = false;
      }
      if (point == null) {
        point = this.caretToTextPoint();
      }
      if (point == null) {
        return point = this.textPoint();
      }
    };

    TextEditView.prototype.onDown = function(e) {
      var tpt;
      tpt = this.pixelToTextPoint({
        x: e.clientX,
        y: e.clientY
      });
      if (this._pressed == null) {
        this._pressed = {};
      }
      if (this._pressed.text == null) {
        this._pressed.text = {};
      }
      this._pressed.text.start = tpt.clone();
      this._pressed.text.pos = tpt;
      this._pressed.text.distance = 0;
      TextEditView.__super__.onDown.call(this, e);
      if (!e.defaultPrevented) {
        if (this._clickCount === 1) {
          this.setCaret(this.caret, this._pressed.text.pos);
        }
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    TextEditView.prototype.onMove = function(e) {
      var tcp, tpt;
      TextEditView.__super__.onMove.call(this, e);
      if (!e.defaultPrevented && (this._pressed != null)) {
        tpt = this.pixelToTextPoint(this._pressed.pixel.pos);
        this._pressed.text.pos = tpt;
        this._pressed.text.distance = tpt.distance(this._pressed.text.start);
        tcp = this.caretToTextPoint(this.caret);
        if (tpt.row !== tcp.row || tpt.col !== tcp.col) {
          this.select(this.caret, this.textRegion(this._pressed.text.start, tpt));
          this.scrollInView();
          this.invalidate();
        }
      }
      return e.stopPropagation();
    };

    TextEditView.prototype.onUp = function(e) {
      TextEditView.__super__.onUp.call(this, e);
      if (!e.defaultPrevented && (this._pressed != null)) {
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    TextEditView.prototype.onDblClick = function(e) {
      var r, tpt;
      TextEditView.__super__.onDblClick.call(this, e);
      debugger;
      if (!e.defaultPrevented && (this._pressed != null)) {
        tpt = this._pressed.text.pos;
        r = this._buffer.wordAt(tpt.row, tpt.col);
        this.select(this.caret, r);
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    return TextEditView;

  })(BaseView);

  TextEditView.register();

}).call(this);
