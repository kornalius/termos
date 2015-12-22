(function() {
  var Framer, Layer,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Layer = require('./layer');

  module.exports = Framer = (function() {
    function Framer(term, x, y, speed, frames) {
      var f, i, len, maxLength, ref;
      this.term = term;
      this.x = x != null ? x : null;
      this.y = y != null ? y : null;
      this.speed = speed != null ? speed : 100;
      this.frames = frames != null ? frames : [''];
      this.render = bind(this.render, this);
      if ((this.x == null) && (this.y == null)) {
        this.x = this.term.x;
        this.y = this.term.y;
      }
      this.fi = 0;
      maxLength = 0;
      ref = this.frames;
      for (i = 0, len = ref.length; i < len; i++) {
        f = ref[i];
        if (f.length > maxLength) {
          maxLength = f.length;
        }
      }
      this.layer = new Layer(this.term, this.x, this.y, maxLength, 1);
      this.interval = setInterval(this.render, this.speed);
      this.cursorHidden = this.term.cursorHidden;
    }

    Framer.prototype.next = function() {
      return this.frames[this.fi++ % this.frames.length];
    };

    Framer.prototype.render = function() {
      var ox, oy;
      this.term.cursorHidden = true;
      ox = this.term.x;
      oy = this.term.y;
      this.term.x = this.x;
      this.term.y = this.y;
      this.layer.blit(this.x, this.y);
      this.term.write(this.next());
      this.term.x = ox;
      this.term.y = oy;
      this.term.cursorHidden = this.cursorHidden;
      return this.term.showCursor();
    };

    Framer.prototype.done = function() {
      this.layer.blit(this.x, this.y, this.saved);
      clearInterval(this.interval);
      this.interval = null;
      this.layer = null;
      this.term.cursorState = 0;
      return this.term.showCursor();
    };

    return Framer;

  })();

}).call(this);
