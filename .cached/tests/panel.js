(function() {
  var PanelView, TestPanel, WebComponent, c, div, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent, PanelView = TOS.PanelView;

  ref = TOS.html, div = ref.div, span = ref.span;

  TestPanel = (function(superClass) {
    extend(TestPanel, superClass);

    function TestPanel() {
      return TestPanel.__super__.constructor.apply(this, arguments);
    }

    TestPanel.prototype.css = {
      ':host': {
        display: 'inline-block',
        margin: '4px'
      }
    };

    TestPanel.prototype.attrs = {
      title: 'SAMPLE TITLE'
    };

    TestPanel.prototype.render = function(content) {
      return TestPanel.__super__.render.call(this, [span('Some content for this wonderful panel view component'), span('Some more content'), content]);
    };

    return TestPanel;

  })(PanelView);

  TestPanel.register();

  c = TOS.createElement('test-panel', {
    icon: 'checkmark'
  });

  document.body.appendChild(c);

}).call(this);
