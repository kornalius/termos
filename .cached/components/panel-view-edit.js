(function() {
  var PanelViewEdit, Plugin, WebComponent, div, hr, i, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent, Plugin = TOS.Plugin;

  ref = TOS.html, div = ref.div, span = ref.span, i = ref.i, hr = ref.hr;

  TOS.PanelViewEdit = PanelViewEdit = (function(superClass) {
    extend(PanelViewEdit, superClass);

    function PanelViewEdit() {
      return PanelViewEdit.__super__.constructor.apply(this, arguments);
    }

    PanelViewEdit.prototype.css = {
      ':host[editmode]': {
        'outline': '2px solid blue'
      }
    };

    PanelViewEdit.prototype.attrs = {
      editMode: false
    };

    PanelViewEdit.prototype.edit = function() {
      return this.attr('editmode', '');
    };

    PanelViewEdit.prototype.isEdit = function() {
      return this.hasAttr('editmode');
    };

    PanelViewEdit.prototype.toggleEdit = function() {
      if (this.isEdit()) {
        return this.cancelEdits();
      } else {
        return this.edit();
      }
    };

    PanelViewEdit.prototype.saveEdits = function() {
      return this.removeAttr('editmode');
    };

    PanelViewEdit.prototype.cancelEdits = function() {
      return this.removeAttr('editmode');
    };

    return PanelViewEdit;

  })(Plugin);

}).call(this);
