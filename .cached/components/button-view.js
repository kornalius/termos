(function() {
  var BaseView, ButtonView, div, i, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView;

  ref = TOS.html, div = ref.div, span = ref.span, i = ref.i;

  TOS.ButtonView = ButtonView = (function(superClass) {
    extend(ButtonView, superClass);

    function ButtonView() {
      return ButtonView.__super__.constructor.apply(this, arguments);
    }

    ButtonView.prototype.classes = ['btn', 'disable-text-selection'];

    ButtonView.prototype.attrs = {
      icon: false,
      label: false,
      primary: false,
      success: false,
      error: false,
      warning: false,
      info: false,
      'on-click': function(e) {
        return console.log('clicked', e);
      }
    };

    ButtonView.prototype.ready = function() {
      ButtonView.__super__.ready.apply(this, arguments);
      this.removeClass(['btn-primary', 'btn-success', 'btn-warning', 'btn-error', 'btn-info', 'btn-outline']);
      if (this.attr('primary')) {
        return this.addClass('btn-primary');
      } else if (this.attr('success')) {
        return this.addClass('btn-success');
      } else if (this.attr('warning')) {
        return this.addClass('btn-warning');
      } else if (this.attr('error')) {
        return this.addClass('btn-error');
      } else if (this.attr('info')) {
        return this.addClass('btn-info');
      } else {
        return this.addClass('btn-outline');
      }
    };

    ButtonView.prototype.render = function(content) {
      return div([this.attr('icon') ? i("#icon.mr1.ic-" + (this.attr('icon'))) : void 0, this.attr('label') ? span('#label', this.attr('label')) : void 0, div('#content', [content])]);
    };

    return ButtonView;

  })(BaseView);

  ButtonView.register();

}).call(this);
