(function() {
  var Layer;

  module.exports = Layer = (function() {
    function Layer(term, x, y, w, h) {
      this.term = term;
      this.lines = null;
      this.copy(x, y, w, h);
    }

    Layer.prototype.copy = function(x, y, w, h) {
      var i, j, l, nx, ny, ref, ref1, ref2, ref3, results, xx, yy;
      this.lines = new Array(h);
      ny = 0;
      results = [];
      for (yy = i = ref = Math.max(y + this.term.shift, 0), ref1 = Math.min(this.term.rows, y + this.term.shift + h); ref <= ref1 ? i < ref1 : i > ref1; yy = ref <= ref1 ? ++i : --i) {
        l = new Array(w);
        nx = 0;
        for (xx = j = ref2 = Math.max(x, 0), ref3 = Math.min(this.term.cols, x + w); ref2 <= ref3 ? j < ref3 : j > ref3; xx = ref2 <= ref3 ? ++j : --j) {
          l[nx++] = _.clone(this.term.screen[yy].chars[xx]);
        }
        results.push(this.lines[ny++] = l);
      }
      return results;
    };

    Layer.prototype.blit = function(x, y) {
      var c, cols, i, j, l, len, len1, ref, rows, sl, xx;
      if (this.lines != null) {
        cols = this.term.cols - 1;
        rows = this.term.rows - 1;
        y += this.term.shift;
        ref = this.lines;
        for (i = 0, len = ref.length; i < len; i++) {
          l = ref[i];
          if (y > rows) {
            break;
          }
          sl = this.term.screen[y++];
          sl.dirty = true;
          xx = Math.max(x, 0);
          for (j = 0, len1 = l.length; j < len1; j++) {
            c = l[j];
            if (xx > cols) {
              break;
            }
            sl.chars[xx++] = c;
          }
          y++;
        }
        return this.term.refresh();
      }
    };

    return Layer;

  })();

}).call(this);
