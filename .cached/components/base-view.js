(function() {
  var BaseView, CustomEvent, Keys, WebComponent, div, hr, i, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent, CustomEvent = TOS.CustomEvent;

  ref = TOS.html, div = ref.div, span = ref.span, i = ref.i, hr = ref.hr;

  Keys = require('combokeys');

  TOS.BaseView = BaseView = (function(superClass) {
    extend(BaseView, superClass);

    function BaseView() {
      return BaseView.__super__.constructor.apply(this, arguments);
    }

    BaseView.prototype.css = {
      ':host': {
        'display': 'inline-block'
      }
    };

    BaseView.prototype.attrs = {
      vertical: false,
      horizontal: false,
      wrap: false,
      center: false,
      stretch: false,
      start: false,
      end: false,
      justify: false,
      small: false,
      medium: false,
      large: false,
      grow: false,
      auto: false,
      none: false,
      first: false,
      last: false
    };

    BaseView.prototype.buildContentClass = function() {
      var c;
      c = '';
      if (this.attr('horizontal')) {
        c += '.flex';
      }
      if (this.attr('vertical')) {
        c += '.flex.flex-column';
      }
      if (c.indexOf('.flex') !== -1) {
        if (this.attr('wrap')) {
          c += '.flex-wrap';
        }
        if (this.attr('center')) {
          c += '.flex-center';
        }
        if (this.attr('stretch')) {
          c += '.flex-stretch';
        }
        if (this.attr('start')) {
          c += '.flex-start';
        }
        if (this.attr('end')) {
          c += '.flex-end';
        }
        if (this.attr('justify')) {
          c += '.flex-justify';
        }
        if (this.attr('small')) {
          c += '.sm-flex';
        }
        if (this.attr('medium')) {
          c += '.md-flex';
        }
        if (this.attr('large')) {
          c += '.lg-flex';
        }
        if (this.attr('grow')) {
          c += '.flex-grow';
        }
        if (this.attr('auto')) {
          c += '.flex-auto';
        }
        if (this.attr('none')) {
          c += '.flex-none';
        }
        if (this.attr('first')) {
          c += '.flex-first';
        }
        if (this.attr('last')) {
          c += '.flex-last';
        }
      }
      return c;
    };

    BaseView.prototype.key = function(sequence, callback) {
      var fn;
      if (this._keys == null) {
        this._keys = new Keys(this);
      }
      fn = (function(_this) {
        return function(e) {
          if (_this.focused()) {
            callback.apply(_this, arguments);
            return e.stopPropagation();
          }
        };
      })(this);
      return this._keys.bind(sequence, fn);
    };

    BaseView.prototype.render = function(content) {
      return div(this.buildContentClass(), [content]);
    };

    return BaseView;

  })(WebComponent);

  BaseView.register();

}).call(this);
