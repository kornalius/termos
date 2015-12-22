(function() {
  var BaseView, CustomEvent, EditCursorView, EditView, TextBuffer, TextCursor, TextPoint, TextRegion, div, ref, ref1, span, textarea,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  BaseView = TOS.BaseView, CustomEvent = TOS.CustomEvent;

  ref = TOS.html, textarea = ref.textarea, div = ref.div, span = ref.span;

  ref1 = require('./text/textbuffer'), TextBuffer = ref1.TextBuffer, TextPoint = ref1.TextPoint, TextRegion = ref1.TextRegion;

  TextCursor = require('./text/textcursor').TextCursor;

  TOS.EditCursorView = EditCursorView = (function(superClass) {
    extend(EditCursorView, superClass);

    function EditCursorView() {
      return EditCursorView.__super__.constructor.apply(this, arguments);
    }

    EditCursorView.prototype.css = {
      ':host': {
        'display': 'block',
        'position': 'absolute',
        'background-color': 'black'
      }
    };

    EditCursorView.prototype.accessor('parentView', function() {
      return this.parentNode.parentNode;
    });

    EditCursorView.prototype.accessor('_buffer', function() {
      return this.parentView._buffer;
    });

    EditCursorView.prototype.accessor('charWidth', function() {
      return this.parentView.charSize.width;
    });

    EditCursorView.prototype.accessor('charHeight', function() {
      return this.parentView.charSize.height;
    });

    EditCursorView.prototype.attached = function() {
      EditCursorView.__super__.attached.apply(this, arguments);
      this._cursor = new TextCursor(this._buffer, 0, 0);
      this.style.width = this.charWidth + 'px';
      return this.style.height = this.charHeight + 'px';
    };

    EditCursorView.prototype.render = function() {
      return div('.edit-cursor-view');
    };

    EditCursorView.prototype.moveTo = function(x, y) {
      this._cursor.moveTo(y, x);
      this._pos = {
        x: x,
        y: y
      };
      this.style.left = x * this.charWidth + 'px';
      return this.style.top = y * this.charHeight + 'px';
    };

    EditCursorView.prototype.moveBy = function(x, y) {
      return this.moveTo(this._pos.x + x, this._pos.y + y);
    };

    EditCursorView.prototype.home = function() {
      return this.moveTo(0, 0);
    };

    EditCursorView.prototype.end = function() {
      return this.moveTo(this.parentView._size.width - 1, this.parentView._size.height - 1);
    };

    EditCursorView.prototype.bol = function() {
      return this.moveTo(0, this._pos.y);
    };

    EditCursorView.prototype.eol = function() {
      return this.moveTo(this.parentView._size.width - 1, this._pos.y);
    };

    EditCursorView.prototype.cr = function() {
      return this.down().bol();
    };

    EditCursorView.prototype.lf = function() {
      return this.down();
    };

    EditCursorView.prototype.bs = function() {
      return this.left();
    };

    EditCursorView.prototype.del = function() {
      return this.parentView.eraseAt(this._pos);
    };

    EditCursorView.prototype.tab = function() {
      return this.moveBy(2, 0);
    };

    EditCursorView.prototype.isBol = function() {
      return this._pos.x === 0;
    };

    EditCursorView.prototype.isEol = function() {
      return this._pos.x === this.parentView._size.width - 1;
    };

    EditCursorView.prototype.isHome = function() {
      return this.isBol() && this._pos.y === 0;
    };

    EditCursorView.prototype.isEnd = function() {
      return this.isEol() && this._pos.y === this.parentView._size.height - 1;
    };

    EditCursorView.prototype.left = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(-count, 0);
      return this;
    };

    EditCursorView.prototype.right = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(count, 0);
      return this;
    };

    EditCursorView.prototype.up = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, -count);
      return this;
    };

    EditCursorView.prototype.down = function(count) {
      if (count == null) {
        count = 1;
      }
      this.moveBy(0, count);
      return this;
    };

    return EditCursorView;

  })(BaseView);

  EditCursorView.register();

  TOS.EditView = EditView = (function(superClass) {
    extend(EditView, superClass);

    function EditView() {
      this.onDblClick = bind(this.onDblClick, this);
      this.onUp = bind(this.onUp, this);
      this.onMove = bind(this.onMove, this);
      this.onDown = bind(this.onDown, this);
      return EditView.__super__.constructor.apply(this, arguments);
    }

    EditView.prototype.css = {
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

    EditView.prototype.textChanged = function(value) {
      return this.async(function() {
        if ((value != null) && (this._buffer != null) && this._buffer.text() !== value) {
          this._buffer.setText(value);
          this.setTextCursor();
          return this.invalidate();
        }
      });
    };

    EditView.prototype.computeCharSize = function() {
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

    EditView.prototype.created = function() {
      EditView.__super__.created.apply(this, arguments);
      this.cursors = [];
      this._viewport = {
        x: 0,
        y: 0
      };
      return this.tabIndex = 0;
    };

    EditView.prototype.attached = function() {
      EditView.__super__.attached.apply(this, arguments);
      if (this.parentNode != null) {
        this._buffer = new TextBuffer(this, '');
        this.setTextCursor();
        this.computeCharSize();
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
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.insert(String.fromCharCode(e.which));
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('backspace', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.deleteBack();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+backspace', 'alt+backspace'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.deleteWordBack();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key('del', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.deleteForward();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+del', 'alt+del'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.deleteWordForward();
            }
            return e.stopPropagation();
          };
        })(this));
        this.key('left', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveLeft();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('right', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveRight();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('up', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveUp();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key('down', (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveDown();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+left', 'alt+left'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveToPrevWord();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['ctrl+right', 'alt+right'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveToNextWord();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['home', 'command+left'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveToLineBegin();
            }
            _this.scrollInView();
            return e.stopPropagation();
          };
        })(this));
        this.key(['end', 'command+right'], (function(_this) {
          return function(e) {
            var c, i, len, ref2;
            ref2 = _this.cursors;
            for (i = 0, len = ref2.length; i < len; i++) {
              c = ref2[i];
              c.moveToLineEnd();
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

    EditView.prototype.render = function(content) {
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
        }).call(this), TOS.html.EditCursorView
      ]);
    };

    EditView.prototype.fromTextPoint = function(point) {
      return this._buffer.point(point.col - this._viewport.x, point.row - this._viewport.y);
    };

    EditView.prototype.pointToTextPoint = function(pos) {
      return this.textPoint(pos.y + this._viewport.y, pos.x + this._viewport.x);
    };

    EditView.prototype.pointToTextIndex = function(point) {
      return this.textPointToTextIndex(this.pointToTextPoint(point));
    };

    EditView.prototype.textPointToTextIndex = function(point) {
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

    EditView.prototype.indexToTextPoint = function(index) {
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

    EditView.prototype.indexToPoint = function(index) {
      return this.fromTextPoint(this.indexToTextPoint(index));
    };

    EditView.prototype.pixelToTextPoint = function(pixel) {
      return this.pointToTextPoint(this.pixelToPos(pixel));
    };

    EditView.prototype.maxLineWidth = function() {
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

    EditView.prototype.textPoint = function(row, col) {
      if (_.isNumber(row) && _.isNumber(col)) {
        return new TextPoint(this._buffer, row, col);
      } else if (row instanceof TextPoint) {
        return row.clone();
      } else if (_.isNumber(row)) {
        return this.indexToTextPoint(row);
      } else if (row instanceof PIXI.Point) {
        return this.pointToTextPoint(row);
      } else if (row instanceof TermCursor) {
        return this.pointToTextPoint(row.pos);
      } else if (row instanceof TextCursor) {
        return this.textCursorPoint(row).clone();
      } else {
        return new TextPoint(this._buffer, 0, 0);
      }
    };

    EditView.prototype.textRegion = function(row, col, row2, col2) {
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

    EditView.prototype.textRegionContains = function(region, point, rect) {
      var begin, end, r;
      if (rect == null) {
        rect = false;
      }
      r = region.ordered();
      if (rect) {
        return point.row >= r.begin.row && point.row <= r.end.row && point.col >= r.begin.col && point.col <= r.end.col;
      } else {
        point = this.textPointToTextIndex(point);
        begin = this.textPointToTextIndex(r.begin);
        end = this.textPointToTextIndex(r.end) - 1;
        return point >= begin && point <= end;
      }
    };

    EditView.prototype.textCursorPoint = function(cursor) {
      if (cursor.region != null) {
        return cursor.region.end;
      } else if (cursor.point != null) {
        return cursor.point;
      } else {
        return this.textPoint();
      }
    };

    EditView.prototype.textCursorRegion = function(cursor) {
      if (cursor.region != null) {
        return cursor.region;
      } else if (cursor.point != null) {
        return this.textRegion(cursor.point);
      } else {
        return this.textRegion();
      }
    };

    EditView.prototype.setTextCursor = function(cursor, point) {
      if (!(cursor instanceof TextCursor)) {
        point = cursor;
        cursor = null;
      }
      if (cursor == null) {
        cursor = this.textCursor;
      }
      if (point == null) {
        point = this.textPoint();
      }
      if (this.isValidTextPoint(point)) {
        if (this.cursors.length === 0) {
          cursor = this.addTextCursor(point);
        } else {
          cursor.moveTo(point);
        }
      }
      return cursor;
    };

    EditView.prototype.addTextCursor = function(point) {
      var c, cursor;
      if (this.isValidTextPoint(point)) {
        cursor = new TextCursor(this._textBuffer, point.row, point.col);
        this.cursors.push(cursor);
        c = this.addCursor(point);
        c._textCursor = cursor;
        cursor._termCursor = c;
        cursor.on('move', (function(_this) {
          return function() {
            var ee;
            ee = Swim.CustomEvent({
              target: cursor
            });
            cursor.emit('text.cursor.move', ee);
            _this.scrollInView();
            c.moveTo(_this.fromTextPoint(_this.textCursorPoint(cursor)));
            return _this.invalidate();
          };
        })(this));
        cursor.attached();
      } else {
        cursor = null;
      }
      return cursor;
    };

    EditView.prototype.removeTextCursor = function(cursor) {
      var point;
      if (!(cursor instanceof TextCursor)) {
        point = cursor;
        cursor = null;
      }
      if (cursor == null) {
        cursor = this.textCursor;
      }
      cursor.detached();
      this.removeCursor(cursor);
      _.remove(this.cursors, cursor);
      return this;
    };

    EditView.prototype.moveTextCursor = function(cursor, point) {
      if (!(cursor instanceof TextCursor)) {
        point = cursor;
        cursor = null;
      }
      if (cursor == null) {
        cursor = this.textCursor;
      }
      if (this.isValidTextPoint(point)) {
        cursor.moveTo(point);
      }
      return this;
    };

    EditView.prototype.selectTextCursor = function(cursor, region) {
      if (!(cursor instanceof TextCursor)) {
        region = cursor;
        cursor = null;
      }
      if (cursor == null) {
        cursor = this.textCursor;
      }
      if (this.isValidTextPoint(region.begin) && this.isValidTextPoint(region.end)) {
        cursor.select(this.textRegion(region));
      }
      return this;
    };

    EditView.prototype.textCursorAt = function(point, regionOnly) {
      var c, i, len, ref2;
      if (regionOnly == null) {
        regionOnly = false;
      }
      if (this.cursors == null) {
        return null;
      }
      ref2 = this.cursors;
      for (i = 0, len = ref2.length; i < len; i++) {
        c = ref2[i];
        if ((c.point != null) && c.point.col === point.col && c.point.row === point.row && !regionOnly) {
          return c;
        } else if ((c.region != null) && this.textRegionContains(c.region, point)) {
          return c;
        }
      }
      return null;
    };

    EditView.prototype.textCursorAtPixel = function(pixel) {
      return this.textCursorAt(this.pixelToTextPoint(pixel));
    };

    EditView.prototype.isValidTextPoint = function(point) {
      if (this._contentSize.x === 0 && this._contentSize.y === 0) {
        return true;
      } else {
        return this.isValidViewPos(this.point(point.col, point.row));
      }
    };

    EditView.prototype.scrollBy = function(pos) {
      var ee, i, len, ref2, tc;
      EditView.__super__.scrollBy.call(this, pos);
      ee = Swim.CustomEvent({
        target: this,
        pos: pos
      });
      this.modes_emit('text.scrollby', ee);
      if (!ee.defaultPrevented) {
        ref2 = this.cursors;
        for (i = 0, len = ref2.length; i < len; i++) {
          tc = ref2[i];
          tc._termCursor.moveTo(this.fromTextPoint(this.textCursorPoint(tc)));
        }
        this.invalidate();
      }
      return this;
    };

    EditView.prototype.scrollInView = function(point, hcenter, vcenter) {
      if (hcenter == null) {
        hcenter = false;
      }
      if (vcenter == null) {
        vcenter = false;
      }
      if (point == null) {
        point = this.textCursorPoint();
      }
      if (point == null) {
        point = this.textPoint();
      }
      return EditView.__super__.scrollInView.call(this, this.point(point.col, point.row), hcenter, vcenter);
    };

    EditView.prototype.onDown = function(e) {
      var tpt;
      tpt = this.pixelToTextPoint(e.data.getLocalPosition(this._container));
      if (this._pressed == null) {
        this._pressed = {};
      }
      if (this._pressed.text == null) {
        this._pressed.text = {};
      }
      this._pressed.text.start = tpt.clone();
      this._pressed.text.pos = tpt;
      this._pressed.text.distance = 0;
      EditView.__super__.onDown.call(this, e);
      if (!e.defaultPrevented) {
        if (this._clickCount === 1) {
          this.setTextCursor(this.textCursor, this._pressed.text.pos);
        }
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    EditView.prototype.onMove = function(e) {
      var tcp, tpt;
      EditView.__super__.onMove.call(this, e);
      if (!e.defaultPrevented && (this._pressed != null)) {
        tpt = this.pixelToTextPoint(this._pressed.pixel.pos);
        this._pressed.text.pos = tpt;
        this._pressed.text.distance = tpt.distance(this._pressed.text.start);
        tcp = this.textCursorPoint(this.textCursor);
        if (tpt.row !== tcp.row || tpt.col !== tcp.col) {
          this.selectTextCursor(this.textCursor, this.textRegion(this._pressed.text.start, tpt));
          this.scrollInView();
          this.invalidate();
        }
      }
      return e.stopPropagation();
    };

    EditView.prototype.onUp = function(e) {
      EditView.__super__.onUp.call(this, e);
      if (!e.defaultPrevented && (this._pressed != null)) {
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    EditView.prototype.onDblClick = function(e) {
      var r, tpt;
      EditView.__super__.onDblClick.call(this, e);
      debugger;
      if (!e.defaultPrevented && (this._pressed != null)) {
        tpt = this._pressed.text.pos;
        r = this._textBuffer.wordAt(tpt.row, tpt.col);
        this.selectTextCursor(this.textCursor, r);
        this.scrollInView();
        this.invalidate();
      }
      return e.stopPropagation();
    };

    EditView.prototype.scrollInView = function() {};

    return EditView;

  })(BaseView);

  EditView.register();

}).call(this);
