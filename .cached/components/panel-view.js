(function() {
  var BaseView, PanelView, PanelViewEdit, div, hr, i, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BaseView = TOS.BaseView, PanelViewEdit = TOS.PanelViewEdit;

  ref = TOS.html, div = ref.div, span = ref.span, i = ref.i, hr = ref.hr;

  TOS.PanelView = PanelView = (function(superClass) {
    extend(PanelView, superClass);

    function PanelView() {
      return PanelView.__super__.constructor.apply(this, arguments);
    }

    PanelView.prototype.attrs = {
      icon: false,
      label: false,
      closable: false,
      resizable: false,
      moveable: false,
      autohide: false,
      'on-click': function() {
        return this.toggleEdit();
      }
    };

    PanelView.prototype.created = function() {
      PanelView.__super__.created.apply(this, arguments);
      return this.async(this.edit, 100);
    };

    PanelView.prototype.render = function(content) {
      var cnt, ruler;
      ruler = false;
      cnt = [];
      if (this.attr('icon')) {
        ruler = true;
        cnt.push(i("#icon.mr1.h3.ic-" + (this.attr('icon'))));
      }
      if (this.attr('label')) {
        ruler = true;
        cnt.push(span('#label.h4.bold', this.attr('label')));
      }
      if (ruler) {
        cnt.push(hr());
      }
      cnt.push(div('#content', content));
      return div('.shadow-1.p1', cnt);
    };

    PanelViewEdit.install(PanelView);

    return PanelView;

  })(BaseView);

  PanelView.register();

}).call(this);
