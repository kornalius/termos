(function() {
  var BaseView, WindowView, div, hr, i, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView;

  ref = TOS.html, div = ref.div, span = ref.span, i = ref.i, hr = ref.hr;

  TOS.WindowView = WindowView = (function(superClass) {
    extend(WindowView, superClass);

    function WindowView() {
      return WindowView.__super__.constructor.apply(this, arguments);
    }

    WindowView.prototype.css = {
      ':host': {
        '.window': {
          height: '24px'
        }
      }
    };

    WindowView.prototype.attrs = {
      icon: false,
      title: false,
      closable: true,
      resizable: true,
      moveable: true,
      minimizable: true,
      maximizable: true
    };

    WindowView.prototype.render = function(content) {
      return div('.window.flex.flex-stretch', [div('.p1.title', [this.attr('icon') ? i("#icon.mr1.h3.ic-" + (this.attr('icon'))) : void 0, this.attr('title') ? span('#title.h4.bold', this.attr('title')) : void 0]), div('#content.fullscreen', [content])]);
    };

    return WindowView;

  })(BaseView);

  WindowView.register();

}).call(this);
