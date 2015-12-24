(function() {
  var ComponentWithAttrObject, MyBaseComponent, MyComponent, WebComponent, c, div, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent;

  ref = TOS.html, div = ref.div, span = ref.span;

  MyBaseComponent = (function(superClass) {
    extend(MyBaseComponent, superClass);

    function MyBaseComponent() {
      return MyBaseComponent.__super__.constructor.apply(this, arguments);
    }

    MyBaseComponent.prototype.css = {
      ':host': {
        color: 'red'
      },
      'span': {
        'font-weight': 'bold'
      }
    };

    MyBaseComponent.prototype.props = {
      prop1: false
    };

    MyBaseComponent.prototype.attrs = {
      attr1: true
    };

    MyBaseComponent.prototype.created = function() {
      MyBaseComponent.__super__.created.apply(this, arguments);
      return console.log("base created", this);
    };

    MyBaseComponent.prototype.attached = function() {
      MyBaseComponent.__super__.attached.apply(this, arguments);
      return console.log("base attached", this);
    };

    MyBaseComponent.prototype.render = function(content) {
      return div([content, span(' WORLD!')]);
    };

    return MyBaseComponent;

  })(WebComponent);

  MyBaseComponent.register();

  MyComponent = (function(superClass) {
    extend(MyComponent, superClass);

    function MyComponent() {
      return MyComponent.__super__.constructor.apply(this, arguments);
    }

    MyComponent.prototype.css = {
      ':host': {
        color: 'orange'
      },
      'span': {
        'font-style': 'italic'
      }
    };

    MyComponent.prototype.props = {
      prop1: 'FUCK THE'
    };

    MyComponent.prototype.attrs = {
      attr2: 'Some Value'
    };

    MyComponent.prototype.created = function() {
      MyComponent.__super__.created.apply(this, arguments);
      return console.log("created", this);
    };

    MyComponent.prototype.attached = function() {
      MyComponent.__super__.attached.apply(this, arguments);
      return console.log("attached", this);
    };

    MyComponent.prototype.render = function() {
      return MyComponent.__super__.render.call(this, span(this.prop1));
    };

    return MyComponent;

  })(MyBaseComponent);

  MyComponent.register();

  ComponentWithAttrObject = (function(superClass) {
    extend(ComponentWithAttrObject, superClass);

    function ComponentWithAttrObject() {
      return ComponentWithAttrObject.__super__.constructor.apply(this, arguments);
    }

    ComponentWithAttrObject.prototype.props = {
      fromAttr: {
        text: 'fromAttr value'
      }
    };

    ComponentWithAttrObject.prototype.render = function() {
      if (this.fromAttr != null) {
        return div(this.fromAttr.text);
      }
    };

    return ComponentWithAttrObject;

  })(WebComponent);

  ComponentWithAttrObject.register();

  c = document.createElement('my-component', {
    prop1: "HELLO"
  });

  document.body.appendChild(c);

  c = document.createElement('component-with-attr-object', {
    fromAttr: {
      text: 'Hello World',
      a: 10
    }
  });

  document.body.appendChild(c);

}).call(this);
