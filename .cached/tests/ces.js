(function() {
  var AttrsEntity, CSSEntity, MyComponent2, Plugin, PropsEntity, WebComponent, c, div, ref, span,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  WebComponent = TOS.WebComponent, Plugin = TOS.Plugin;

  ref = TOS.html, div = ref.div, span = ref.span;

  CSSEntity = (function(superClass) {
    extend(CSSEntity, superClass);

    function CSSEntity() {
      return CSSEntity.__super__.constructor.apply(this, arguments);
    }

    CSSEntity.prototype.css = {
      ':host': {
        color: 'blue'
      }
    };

    CSSEntity.prototype.props = {
      prop1: 567,
      prop3: 8792
    };

    return CSSEntity;

  })(Plugin);

  PropsEntity = (function(superClass) {
    extend(PropsEntity, superClass);

    function PropsEntity() {
      return PropsEntity.__super__.constructor.apply(this, arguments);
    }

    PropsEntity.prototype.props = {
      prop1: 23849,
      prop3: 238
    };

    PropsEntity.prototype.attached = function() {
      return console.log("attached PropsEntity", this);
    };

    PropsEntity.prototype.render = function(content) {
      return div("render PropsEntity");
    };

    return PropsEntity;

  })(Plugin);

  AttrsEntity = (function(superClass) {
    extend(AttrsEntity, superClass);

    function AttrsEntity() {
      return AttrsEntity.__super__.constructor.apply(this, arguments);
    }

    AttrsEntity.prototype.attrs = {
      attr1: "Nice Job",
      attr2: "Attribute Value",
      attr4: "Added"
    };

    AttrsEntity.prototype.attached = function() {
      return console.log("attached AttrsEntity", this);
    };

    AttrsEntity.prototype.render = function(content) {
      return div("render AttrsEntity");
    };

    return AttrsEntity;

  })(Plugin);

  MyComponent2 = (function(superClass) {
    extend(MyComponent2, superClass);

    function MyComponent2() {
      return MyComponent2.__super__.constructor.apply(this, arguments);
    }

    MyComponent2.prototype.css = {
      ':host': {
        color: 'red'
      },
      'span': {
        'font-weight': 'bold'
      }
    };

    MyComponent2.prototype.attrs = {
      attr1: true,
      attr2: "Some kind of value",
      attr3: "Another one"
    };

    MyComponent2.prototype.props = {
      prop1: 124,
      prop2: 543
    };

    MyComponent2.prototype.created = function() {};

    MyComponent2.prototype.attached = function() {
      return console.log("attached MyComponent2", this);
    };

    MyComponent2.prototype.render = function(content) {
      return div([content, span(this.attr('attr2'))]);
    };

    PropsEntity.install(MyComponent2);

    AttrsEntity.install(MyComponent2);

    CSSEntity.install(MyComponent2);

    return MyComponent2;

  })(WebComponent);

  MyComponent2.register();

  c = document.createElement('my-component2');

  document.body.appendChild(c);

}).call(this);
