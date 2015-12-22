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
      title: false,
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
      var ruler;
      ruler = false;
      return div('.shadow-1.p1', [this.attr('icon') ? (ruler = true, i("#icon.mr1.h3.ic-" + (this.attr('icon')))) : void 0, this.attr('title') ? (ruler = true, span('#title.h4.bold', this.attr('title'))) : void 0, ruler ? hr() : void 0, div('#content', [content])]);
    };

    PanelViewEdit.install(PanelView);

    return PanelView;

  })(BaseView);

  PanelView.register();

}).call(this);
