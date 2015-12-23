(function() {
  var ArrayObserver, CompoundObserver, EventEmitter, ObjectObserver, ObserverTransform, Path, PathObserver, PropertyAccessors, S_INITIALIZING, S_NONE, S_RENDERING, VNode, VText, WebComponent, _appendElement, _classify, _createElement, _elementConstructor, _isElementRegistered, _renderAll, _status, _toRender, ccss, create, createElementFn, diff, elements, escape, fromHTML, hasObjectObserve, html, isEmpty, isSelector, isThunk, isVNode, isVText, j, len, parseAttrs, patch, processContents, raf, ref, ref1, tag, toHTML,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('virtual-dom'), create = ref.create, diff = ref.diff, patch = ref.patch, VNode = ref.VNode, VText = ref.VText;

  PropertyAccessors = require('property-accessors');

  EventEmitter = require('eventemitter3');

  fromHTML = require('html-to-vdom')({
    VNode: VNode,
    VText: VText
  });

  toHTML = require('vdom-to-html');

  isVNode = require('virtual-dom/vnode/is-vnode');

  isVText = require('virtual-dom/vnode/is-vtext');

  isThunk = require('virtual-dom/vnode/is-thunk');

  ccss = require('ccss');

  raf = require('raf');

  ref1 = require('observe-js'), PathObserver = ref1.PathObserver, ArrayObserver = ref1.ArrayObserver, ObjectObserver = ref1.ObjectObserver, hasObjectObserve = ref1.hasObjectObserve, CompoundObserver = ref1.CompoundObserver, Path = ref1.Path, ObserverTransform = ref1.ObserverTransform;

  elements = ['html', 'head', 'title', 'base', 'link', 'meta', 'style', 'script', 'noscript', 'body', 'section', 'nav', 'article', 'aside', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hgroup', 'header', 'footer', 'address', 'main', 'p', 'hr', 'pre', 'blockquote', 'ol', 'ul', 'li', 'dl', 'dt', 'dd', 'figure', 'figcaption', 'div', 'a', 'em', 'strong', 'small', 's', 'cite', 'q', 'dfn', 'abbr', 'data', 'time', 'code', 'var', 'samp', 'kbd', 'sub', 'sup', 'i', 'b', 'u', 'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'span', 'br', 'wbr', 'ins', 'del', 'img', 'iframe', 'embed', 'object', 'param', 'video', 'audio', 'source', 'track', 'canvas', 'map', 'area', 'svg', 'math', 'table', 'caption', 'colgroup', 'col', 'tbody', 'thead', 'tfoot', 'tr', 'td', 'th', 'form', 'fieldset', 'legend', 'label', 'input', 'button', 'select', 'datalist', 'optgroup', 'option', 'textarea', 'keygen', 'output', 'progress', 'meter', 'details', 'summary', 'command', 'menu'];

  isEmpty = {
    'area': true,
    'base': true,
    'br': true,
    'col': true,
    'hr': true,
    'img': true,
    'input': true,
    'link': true,
    'meta': true,
    'param': true,
    'embed': true
  };

  escape = function(s) {
    s = '' + s;
    s = s.replace(/&/g, '&amp;');
    s = s.replace(/</g, '&lt;');
    s = s.replace(/>/g, '&gt;');
    s = s.replace(/"/g, '&quot;');
    s = s.replace(/'/g, '&#39;');
    return s;
  };

  parseAttrs = function(str) {
    var attrs, buffer, c, ch, classes, createBuffer, customs, i, ids, j, l, len, pushBuffer, ref2;
    classes = [];
    ids = [];
    customs = [];
    buffer = null;
    createBuffer = function(type) {
      return buffer = {
        type: type,
        chars: ''
      };
    };
    pushBuffer = function() {
      if (buffer.type === 'class') {
        classes.push(buffer.chars);
      } else if (buffer.type === 'id') {
        ids.push(buffer.chars);
      } else if (buffer.type === 'attr') {
        customs.push(buffer.chars);
      }
      return buffer = null;
    };
    for (i = j = 0, ref2 = str.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
      ch = str[i];
      switch (ch) {
        case '.':
          if (buffer != null) {
            pushBuffer();
          }
          createBuffer('class');
          break;
        case '#':
          if (buffer != null) {
            pushBuffer();
          }
          createBuffer('id');
          break;
        case '@':
          if (buffer != null) {
            pushBuffer();
          }
          createBuffer('attr');
          break;
        default:
          if (buffer == null) {
            throw new Error("Malformed attribute string: \"" + str + "\"");
          }
          buffer.chars += ch;
      }
    }
    if (buffer != null) {
      pushBuffer();
    }
    attrs = {};
    if (ids.length) {
      attrs.id = ids.join(' ');
    }
    if (classes.length) {
      attrs['class'] = classes.join(' ');
    }
    if (customs.length) {
      for (l = 0, len = customs.length; l < len; l++) {
        c = customs[l];
        attrs[c] = '';
      }
    }
    return attrs;
  };

  processContents = function(contents) {
    var c, j, len, r, rc;
    r = [];
    if (_.isArray(contents)) {
      for (j = 0, len = contents.length; j < len; j++) {
        c = contents[j];
        if (!(c != null)) {
          continue;
        }
        rc = processContents(c);
        if (_.isArray(rc)) {
          if (rc.length === 1) {
            rc = rc[0];
          } else if (rc.length === 0) {
            rc = null;
          }
        }
        if (rc != null) {
          r.push(rc);
        }
      }
    } else if (_.isFunction(contents)) {
      r = contents.call(this);
    } else if (_.isString(contents)) {
      r = new VText(contents);
    } else if (contents instanceof VNode || contents instanceof VText) {
      r = contents;
    }
    if (_.isArray(r)) {
      return r;
    } else {
      return [r];
    }
  };

  isSelector = function(string) {
    var ref2;
    return _.isString(string) && string.length > 1 && ((ref2 = string.charAt(0)) === '#' || ref2 === '.');
  };

  createElementFn = function(tag, proto, empty) {
    return function(attrs, contents) {
      var inner, keys, properties, selector;
      if (_.isArray(attrs)) {
        contents = attrs;
        attrs = null;
      }
      selector = isSelector(attrs);
      if (_.isString(attrs)) {
        if (selector) {
          attrs = parseAttrs(attrs);
        } else {
          contents = attrs;
          attrs = null;
        }
      }
      if (!_.isPlainObject(attrs)) {
        attrs = {};
      }
      if (_.isPlainObject(contents)) {
        _.extend(attrs, contents);
        contents = null;
      }
      inner = processContents(contents);
      keys = (proto != null ? proto.props : void 0) != null ? _.keys(proto.props) : [];
      properties = _.pick(attrs, function(v, k) {
        return _.contains(keys, k);
      });
      properties.attributes = _.pick(attrs, function(v, k) {
        return !_.contains(keys, k);
      });
      return new VNode(tag, properties, inner);
    };
  };

  html = {};

  for (j = 0, len = elements.length; j < len; j++) {
    tag = elements[j];
    html[tag] = createElementFn(tag, isEmpty[tag]);
  }

  S_NONE = 0;

  S_INITIALIZING = 1;

  S_RENDERING = 2;

  _toRender = [];

  _status = S_NONE;

  raf(_renderAll = function() {
    var l, len1, r, t;
    _status = S_RENDERING;
    if (_toRender.length) {
      t = _.clone(_toRender);
      _toRender.length = 0;
      for (l = 0, len1 = t.length; l < len1; l++) {
        r = t[l];
        r._dom();
      }
    }
    _status = S_NONE;
    return raf(_renderAll);
  });

  _classify = function(name) {
    return _.capitalize(_.camelize(name));
  };

  _isElementRegistered = function(name) {
    return _elementConstructor(name) !== HTMLElement;
  };

  _elementConstructor = function(name) {
    return document.createElement(name).constructor;
  };

  _createElement = function(name, attrs) {
    return document.createElement(name, attrs);
  };

  _appendElement = function(name, selector, attrs) {
    var el;
    el = _createElement(name, attrs);
    $(selector).appendChild(el);
    return el;
  };

  module.exports = {
    raf: raf,
    ccss: ccss,
    html: html,
    toRender: _toRender,
    status: function() {
      return _status;
    },
    vdom: {
      create: create,
      diff: diff,
      patch: patch,
      VNode: VNode,
      VText: VText,
      fromHTML: fromHTML,
      toHTML: toHTML,
      isVNode: isVNode,
      isVText: isVText,
      isThunk: isThunk
    },
    isElementRegistered: _isElementRegistered,
    elementConstructor: _elementConstructor,
    createElement: _createElement,
    appendElement: _appendElement,
    css: {
      none: 'none',
      auto: 'auto',
      inherit: 'inherit',
      hidden: 'hidden',
      pointer: 'pointer',
      normal: 'normal',
      block: 'block',
      transparent: 'transparent',
      absolute: 'absolute',
      relative: 'relative',
      baseline: 'baseline',
      center: 'center',
      middle: 'middle',
      top: 'top',
      left: 'left',
      bottom: 'bottom',
      right: 'right',
      rgb: function(red, green, blue) {
        return "rgb(" + red + ", " + green + ", " + blue + ")";
      },
      rgba: function(red, green, blue, opacity) {
        return "rgba(" + red + ", " + green + ", " + blue + ", " + opacity + ")";
      },
      em: function() {
        var a, l, len1, r;
        r = [];
        for (l = 0, len1 = arguments.length; l < len1; l++) {
          a = arguments[l];
          r.push(a + 'em');
        }
        return r.join(' ');
      },
      rem: function() {
        var a, l, len1, r;
        r = [];
        for (l = 0, len1 = arguments.length; l < len1; l++) {
          a = arguments[l];
          r.push(a + 'rem');
        }
        return r.join(' ');
      },
      px: function() {
        var a, l, len1, r;
        r = [];
        for (l = 0, len1 = arguments.length; l < len1; l++) {
          a = arguments[l];
          r.push(a + 'px');
        }
        return r.join(' ');
      },
      important: function() {
        return Array.prototype.slice.call(arguments).join(' ') + ' !important';
      }
    },
    WebComponent: WebComponent = (function(superClass) {
      extend(WebComponent, superClass);

      function WebComponent() {
        return WebComponent.__super__.constructor.apply(this, arguments);
      }

      PropertyAccessors.includeInto(WebComponent);

      WebComponent.register = function() {
        var cname, dname, e, proto;
        dname = _.dasherize(this.name);
        if (!_isElementRegistered(dname)) {
          _status = S_INITIALIZING;
          cname = this.name.toLowerCase();
          proto = Object.create(this.prototype.constructor).prototype;
          proto._componentName = cname;
          proto._elementName = dname;
          e = document.registerElement(dname, {
            prototype: proto
          });
          html[cname] = createElementFn(dname, proto, false);
          return _status = S_NONE;
        }
      };

      WebComponent.prototype.createdCallback = function() {
        _.extend(this.__proto__, EventEmitter.prototype);
        this.isReady = false;
        this.isAttached = false;
        this._vdom = null;
        this._vdom_style = null;
        this._observers = [];
        if (_status !== S_INITIALIZING) {
          this._uniqueId = _.uniqueId();
          this.classList.add(this._elementName + "-" + this._uniqueId);
          if (this.created != null) {
            this.created();
          }
        }
        return this._prepare();
      };

      WebComponent.prototype._bindInputs = function() {
        var that;
        if (_status === S_INITIALIZING) {
          return;
        }
        that = this;
        return $(this._el).find('input').each(function(el) {
          var path;
          el = $(el);
          path = el.attr('bind');
          if ((path != null) && (_.valueForKeyPath(that, path) != null)) {
            if (el.attr('type') == null) {
              el.attr('type', 'text');
            }
            switch (el.attr('type').toLowerCase()) {
              case 'checkbox':
                el.on('change', function(e) {
                  return _.setValueForKeyPath(that, path, el[0].checked);
                });
                return el[0].checked = _.valueForKeyPath(that, path);
              case 'radio':
                el.on('change', function(e) {
                  return _.setValueForKeyPath(that, path, el[0].checked);
                });
                return el[0].checked = _.valueForKeyPath(that, path);
              default:
                el.on('keyup', function(e) {
                  return _.setValueForKeyPath(that, path, el[0].value);
                });
                return el[0].value = _.valueForKeyPath(that, path);
            }
          }
        });
      };

      WebComponent.prototype._removeEvents = function() {
        return $(this._el).off();
      };

      WebComponent.prototype._createEvents = function() {
        var fn, key, ref2, results, value;
        if (_status === S_INITIALIZING) {
          return;
        }
        ref2 = this.getEvents();
        results = [];
        for (key in ref2) {
          value = ref2[key];
          key = key.substr(3);
          if (value == null) {
            results.push($(this._el).off(key));
          } else if (_.isFunction(value)) {
            results.push($(this._el).on(key, value.bind(this)));
          } else if (_.isString(value)) {
            fn = this.methods[value];
            if (_.isFunction(fn)) {
              results.push($(this._el).on(key, fn.bind(this)));
            } else {
              results.push($(this._el).on(key, new Function(['event'], value).bind(this)));
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      WebComponent.prototype._createClasses = function() {
        var c, l, len1, ref2, results;
        if (_status === S_INITIALIZING) {
          return;
        }
        ref2 = this.getClasses();
        results = [];
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          c = ref2[l];
          results.push(this.classList.add(c));
        }
        return results;
      };

      WebComponent.prototype._createAttrs = function() {
        var key, ref2, results, value;
        if (_status === S_INITIALIZING) {
          return;
        }
        ref2 = this.getAttrs();
        results = [];
        for (key in ref2) {
          value = ref2[key];
          if (key === 'title') {
            debugger;
          }
          if ((value != null) && value !== false && !this.hasAttribute(key)) {
            results.push(this.setAttribute(key, value === true ? '' : value.toString()));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };

      WebComponent.prototype._observeProps = function() {
        var k, l, len1, o, ref2, ref3, results, that, v;
        if (_status === S_INITIALIZING) {
          return;
        }
        ref2 = this._observers;
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          o = ref2[l];
          o.close();
        }
        this._observers = [];
        that = this;
        ref3 = this.getProps();
        results = [];
        for (k in ref3) {
          v = ref3[k];
          this[k] = v;
          results.push(this._observe(k, function(e) {
            var n;
            n = k + "Changed";
            if (that[n] != null) {
              that[n].call(that, n, e.newValue);
            }
            return that.invalidate();
          }));
        }
        return results;
      };

      WebComponent.prototype._observe = function(path, fn) {
        var observer;
        if (path != null) {
          observer = new PathObserver(this, path);
          observer.open(function(newValue, oldValue) {
            if (fn != null) {
              return fn.call(this, {
                observer: observer,
                path: path,
                newValue: newValue,
                oldValue: oldValue
              });
            }
          });
        } else if (_.isArray(this)) {
          observer = new ArrayObserver(this);
          observer.open(function(splices) {
            var l, len1, results, splice;
            results = [];
            for (l = 0, len1 = splices.length; l < len1; l++) {
              splice = splices[l];
              if (fn != null) {
                results.push(fn.call(this, {
                  observer: observer,
                  path: path,
                  slices: splices
                }));
              } else {
                results.push(void 0);
              }
            }
            return results;
          });
        } else if (_.isObject(this) && _.keys(this).length) {
          observer = new ObjectObserver(this);
          observer.open(function(added, removed, changed, getOldValueFn) {
            if (fn != null) {
              return fn.call(this, {
                observer: observer,
                path: path,
                added: added,
                removed: removed,
                changed: changed,
                getOldValueFn: getOldValueFn
              });
            }
          });
        }
        this._observers.push(observer);
        observer.instance = this;
        return observer;
      };

      WebComponent.prototype._createIds = function() {
        var _createElementIds, that;
        if (_status === S_INITIALIZING) {
          return;
        }
        that = this;
        this.$ = {};
        _createElementIds = function(el) {
          var e, l, len1, ref2, results;
          ref2 = el.childNodes;
          results = [];
          for (l = 0, len1 = ref2.length; l < len1; l++) {
            e = ref2[l];
            if (!_.isEmpty(e.id)) {
              that.$[_.camelize(e.id)] = e;
            }
            results.push(_createElementIds(e));
          }
          return results;
        };
        return _createElementIds(this._el);
      };

      WebComponent.prototype._prepare = function() {
        this._dom();
        this._removeEvents();
        this._bindInputs();
        this._createClasses();
        this._createAttrs();
        this._createEvents();
        this._observeProps();
        if (this._el_style != null) {
          document.head.appendChild(this._el_style);
        }
        if (this._el != null) {
          this.appendChild(this._el);
        }
        return this._createIds();
      };

      WebComponent.prototype.attachedCallback = function() {
        if (this.ready != null) {
          this.ready();
        }
        this.isReady = true;
        this._dom();
        this._removeEvents();
        this._bindInputs();
        this._createClasses();
        this._createAttrs();
        this._createEvents();
        this._observeProps();
        if (_.contains(_toRender, this)) {
          _.remove(_toRender, this);
        }
        if (this.attached != null) {
          this.attached();
        }
        return this.isAttached = true;
      };

      WebComponent.prototype.focused = function() {
        return document.activeElement === this;
      };

      WebComponent.prototype.detachedCallback = function() {
        var l, len1, o, ref2;
        this._removeEvents();
        ref2 = this._observers;
        for (l = 0, len1 = ref2.length; l < len1; l++) {
          o = ref2[l];
          o.close();
        }
        this._observers = [];
        if (this.detached != null) {
          this.detached();
        }
        return this.isAttached = false;
      };

      WebComponent.prototype.attributeChangedCallback = function(name, oldValue, newValue) {
        if (this[name + 'Changed'] != null) {
          this[name + 'Changed'].call(this, newValue, oldValue);
        }
        if (this.isAttached) {
          return this.invalidate();
        }
      };

      WebComponent.prototype._dom = function() {
        var css, key, patches, ref2, style, uuid, v, value, vs;
        if (_status === S_INITIALIZING) {
          return;
        }
        uuid = this._uniqueId;
        if (uuid != null) {
          css = {};
          ref2 = this.getCSS();
          for (key in ref2) {
            value = ref2[key];
            if (key.match(/\:host/gi)) {
              key = key.replace(/\:host/gi, "." + this._elementName + "-" + uuid);
            } else {
              key = "." + this._elementName + "-" + uuid + " " + key;
            }
            css[key] = value;
          }
          style = ccss.compile(css);
          vs = fromHTML("<style>" + style + "</style>");
          if (this._vdom_style == null) {
            this._el_style = create(vs);
          } else {
            patches = diff(this._vdom_style, vs);
            this._el_style = patch(this._el_style, patches);
          }
          this._vdom_style = vs;
          v = this.render();
          if (_.isArray(v) || (v == null)) {
            v = new VNode('div', {}, v);
          }
          if (this._vdom == null) {
            this._el = create(v);
          } else {
            patches = diff(this._vdom, v);
            this._el = patch(this._el, patches);
          }
          this._vdom = v;
        }
        if (this.updated != null) {
          return this.updated();
        }
      };

      WebComponent.prototype.invalidate = function() {
        console.log("invalidate", this, _toRender);
        if (!_.contains(_toRender, this)) {
          return _toRender.push(this);
        }
      };

      WebComponent.prototype.invalidated = function() {
        return _.contains(_toRender, this);
      };

      WebComponent.prototype.getCSS = function() {
        var c, ref2;
        c = {};
        if (((ref2 = this.__proto__) != null ? ref2.getCSS : void 0) != null) {
          _.deepExtend(c, this.__proto__.getCSS());
        }
        if (this.hasOwnProperty('css')) {
          _.deepExtend(c, this.css);
        }
        return c;
      };

      WebComponent.prototype.getProps = function() {
        var p, ref2;
        p = {};
        if (((ref2 = this.__proto__) != null ? ref2.getProps : void 0) != null) {
          _.extend(p, this.__proto__.getProps());
        }
        if (this.hasOwnProperty('props')) {
          _.extend(p, this.props);
        }
        return p;
      };

      WebComponent.prototype.getAttrs = function() {
        var a, key, r, ref2, value;
        a = {};
        if (((ref2 = this.__proto__) != null ? ref2.getAttrs : void 0) != null) {
          _.extend(a, this.__proto__.getAttrs());
        }
        if (this.hasOwnProperty('attrs')) {
          _.extend(a, this.attrs);
        }
        r = {};
        for (key in a) {
          value = a[key];
          if (!key.startsWith('on-')) {
            r[key] = value;
          }
        }
        return r;
      };

      WebComponent.prototype.getEvents = function() {
        var e, key, r, ref2, ref3, value;
        e = {};
        if (((ref2 = this.__proto__) != null ? ref2.getEvents : void 0) != null) {
          _.extend(e, this.__proto__.getEvents());
        }
        if (this.hasOwnProperty('events')) {
          _.extend(e, this.events);
        }
        r = {};
        ref3 = this.getAttrs();
        for (key in ref3) {
          value = ref3[key];
          if (key.startsWith('on-')) {
            r[key] = value;
          }
        }
        for (key in e) {
          value = e[key];
          r[key] = value;
        }
        return r;
      };

      WebComponent.prototype.getClasses = function() {
        var c, ref2;
        c = [];
        if (((ref2 = this.__proto__) != null ? ref2.getClasses : void 0) != null) {
          _.extend(c, this.__proto__.getClasses());
        }
        if (this.hasOwnProperty('classes')) {
          _.extend(c, this.classes);
        }
        return c;
      };

      WebComponent.prototype.created = function() {};

      WebComponent.prototype.ready = function() {};

      WebComponent.prototype.attached = function() {};

      WebComponent.prototype.detached = function() {};

      WebComponent.prototype.updated = function() {};

      WebComponent.prototype.render = function() {
        return '<div></div>';
      };

      return WebComponent;

    })(HTMLElement)
  };

}).call(this);
