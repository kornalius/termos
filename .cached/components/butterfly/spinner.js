(function() {
  var Framer, Spinner,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Framer = require('./framer');

  module.exports = Spinner = (function(superClass) {
    extend(Spinner, superClass);

    function Spinner(term, type) {
      var a;
      this.term = term;
      if (type == null) {
        type = 0;
      }
      switch (type) {
        case 1:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▁'];
          break;
        case 2:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['▖', '▘', '▝', '▗'];
          break;
        case 3:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['◢', '◣', '◤', '◥'];
          break;
        case 4:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['◐', '◓', '◑', '◒'];
          break;
        case 5:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈'];
          break;
        case 6:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['▉', '▊', '▋', '▌', '▍', '▎', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
          break;
        case 7:
          a = ['[   ]', '[>  ]', '[>> ]', '[>>>]', '[ >>]', '[  >]', '[   ]', '[  <]', '[ <<]', '[<<<]', '[<< ]', '[<  ]'];
          break;
        default:
          a = process.platform === 'win32' ? ['-', '\\', '|', '/'] : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      }
      Spinner.__super__.constructor.call(this, this.term, this.term.x, this.term.y, 100, a);
    }

    return Spinner;

  })(Framer);

}).call(this);
