(function() {
  var TerminalView, TestTerm, WebComponent, app, c,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent, TerminalView = TOS.TerminalView, app = TOS.app;

  TestTerm = (function(superClass) {
    extend(TestTerm, superClass);

    function TestTerm() {
      return TestTerm.__super__.constructor.apply(this, arguments);
    }

    TestTerm.prototype.attached = function() {
      var spinner;
      TestTerm.__super__.attached.apply(this, arguments);
      this.writeln("");
      this.write(this.col.bgRed(" Welcome to termOS " + this.col._190('v' + this.col.italic(app.getVersion()) + ' ')) + ' ');
      this.writeln("");
      this.writeln(this.col.gray("io.js: " + process.version));
      this.writeln(this.col.gray("electron: v" + process.versions['electron']));
      this.writeln(this.col.gray("CoffeeScript: " + (require('coffee-script').VERSION)));
      this.writeln(this.col.gray("ALASQL: " + alasql.version));
      this.writeln("");
      this.writeln("Table output demo...");
      this.writeln("");
      this.writeln(this.table([['0A', '0B', '0C'], ['1A', '1B', '1C'], ['2A', '2B', '2C']]));
      this.write(this.col.yellow("Spinner demo "));
      spinner = this.spinner();
      this.writeln("");
      this.writeln("");
      return this.async(function() {
        var i, j;
        spinner.done();
        spinner = null;
        this.write("Success message demo " + this.success('Done!'));
        this.writeln("");
        this.saveCursor();
        this.cur.home().right(7);
        for (i = j = 40; j <= 47; i = ++j) {
          this.attr([i]);
          this.write(' ');
        }
        this.resetAttr();
        this.restoreCursor();
        this.writeln("");
        this.writeln("Icons demo...");
        this.writeln("");
        this.startIcons();
        this.writeln(this.icons.timer + this.icons.heart_fill + this.icons.curved_arrow + '\n' + this.icons.transfer + this.icons.comments + this.icons.bug);
        this.endIcons();
        this.writeln("");
        return this.writeln("Not bad hein?");
      }, 2500);
    };

    return TestTerm;

  })(TerminalView);

  TestTerm.register();

  c = TOS.createElement('test-term');

  document.body.appendChild(c);

}).call(this);
