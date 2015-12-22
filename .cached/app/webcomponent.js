(function() {
  var ArrayObserver, CompoundObserver, EventEmitter, ObjectObserver, ObserverTransform, Path, PathObserver, PropertyAccessors, S_INITIALIZING, S_NONE, S_RENDERING, VNode, VText, WebComponent, _appendElement, _classify, _createElement, _elementConstructor, _isElementRegistered, _renderAll, _status, _toRender, attrObjects, attrPairs, ccss, create, createElementFn, diff, elements, escape, fromHTML, hasObjectObserve, html, isEmpty, isSelector, isThunk, isVNode, isVText, j, len, parseAttrs, patch, raf, ref, ref1, stringifyAttr, stringifyAttrs, stringifyContents, tag, toHTML,
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

  attrObjects = {};

  attrPairs = function(obj) {
    var k, r;
    r = [];
    for (k in obj) {
      if (obj.hasOwnProperty(k)) {
        r.push([k, obj[k]]);
      }
    }
    return r;
  };

  stringifyAttr = function(k, v) {
    var id;
    if (_.isPlainObject(v)) {
      id = _.uniqueId();
      attrObjects[id] = v;
      v = "[[" + id + "]]";
    }
    return (escape(k)) + "=\"" + (escape(v)) + "\"";
  };

  stringifyAttrs = function(attrs) {
    var i, j, pairs, r, ref2;
    pairs = attrPairs(attrs);
    r = [];
    for (i = j = 0, ref2 = pairs.length; 0 <= ref2 ? j < ref2 : j > ref2; i = 0 <= ref2 ? ++j : --j) {
      r.push(stringifyAttr(pairs[i][0], pairs[i][1]));
    }
    return r.join(' ');
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

  stringifyContents = function(contents) {
    var c, j, len, r, str;
    if (_.isArray(contents)) {
      str = '';
      for (j = 0, len = contents.length; j < len; j++) {
        c = contents[j];
        str += stringifyContents(c);
      }
      return str;
    } else if (_.isFunction(contents)) {
      r = contents.call(this);
      if (r == null) {
        r = '';
      }
      return r;
    } else if (contents != null) {
      return contents.toString();
    } else {
      return '';
    }
  };

  isSelector = function(string) {
    var ref2;
    return string.length > 1 && ((ref2 = string.charAt(0)) === '#' || ref2 === '.');
  };

  createElementFn = function(tag, empty) {
    return function(attrs, contents) {
      var attrstr, inner, selector;
      selector = _.isString(attrs) ? isSelector(attrs) : false;
      if (_.isString(attrs) && _.isArray(contents)) {

      } else if (_.isString(attrs) && !selector) {
        contents = attrs;
        attrs = null;
      } else if (_.isArray(attrs)) {
        contents = attrs;
        attrs = null;
      }
      attrs = attrs || {};
      if (_.isString(attrs) && selector) {
        attrs = parseAttrs(attrs);
      }
      attrstr = stringifyAttrs(attrs);
      inner = stringifyContents(contents);
      if (empty) {
        return "<" + tag + ((attrstr != null ? attrstr.length : void 0) ? ' ' + attrstr : '') + "/>";
      } else {
        return "<" + tag + ((attrstr != null ? attrstr.length : void 0) ? ' ' + attrstr : '') + ">" + inner + "</" + tag + ">";
      }
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
    var el, key, value;
    el = document.createElement(name);
    for (key in attrs) {
      value = attrs[key];
      el.setAttribute(key, value === true ? '' : value.toString());
    }
    return el;
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
          cname = _.camelize(this.name);
          proto = Object.create(this.prototype.constructor).prototype;
          proto._componentName = cname;
          proto._elementName = dname;
          e = document.registerElement(dname, {
            prototype: proto
          });
          html[cname] = createElementFn(dname, false);
          return _status = S_NONE;
        }
      };

      WebComponent.prototype.createdCallback = function() {
        var uuid;
        _.extend(this.__proto__, EventEmitter.prototype);
        this.isReady = false;
        this.isAttached = false;
        this._vdom = null;
        this._vdom_style = null;
        this._observers = [];
        if (_status !== S_INITIALIZING) {
          if (this.created != null) {
            this.created();
          }
          uuid = _.uniqueId();
          this._uniqueId = uuid;
          this.classList.add(this._elementName + "-" + uuid);
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
          if (!this.hasAttribute(key) && (value != null) && value !== false) {
            results.push(this.setAttribute(key, value === true ? '' : value.toString()));
          } else {
            results.push(void 0);
          }
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

      WebComponent.prototype._observeProps = function() {
        var k, ref2, results, v;
        if (_status === S_INITIALIZING) {
          return;
        }
        ref2 = this.getProps();
        results = [];
        for (k in ref2) {
          v = ref2[k];
          this[k] = v;
          results.push(this._observe(k, ((function(_this) {
            return function() {
              return _this.invalidate();
            };
          })(this))));
        }
        return results;
      };

      WebComponent.prototype.attachedCallback = function() {
        if (this.ready != null) {
          this.ready();
        }
        this.isReady = true;
        this._dom();
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
        uuid = this._uniqueId || _.uniqueId();
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
        html = this.render();
        if (_.isFunction(html)) {
          html = html.call(this);
        }
        if (_.isArray(html)) {
          html = "<div>" + (stringifyContents(html)) + "</div>";
        }
        if (_.isEmpty(html)) {
          html = '<div></div>';
        }
        v = fromHTML(html);
        if (this._vdom == null) {
          this._el = create(v);
        } else {
          patches = diff(this._vdom, v);
          this._el = patch(this._el, patches);
        }
        this._vdom = v;
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
        if (this.__super__ != null) {
          c = _.deepExtend({}, WebComponent.__super__.getCSS.apply(this, arguments), c);
        }
        if (((ref2 = this.__proto__) != null ? ref2.getCSS : void 0) != null) {
          c = _.deepExtend({}, this.__proto__.getCSS(), c);
        }
        return _.deepExtend({}, c, this.css);
      };

      WebComponent.prototype.getProps = function() {
        var p, ref2;
        p = {};
        if (this.__super__ != null) {
          p = _.extend({}, WebComponent.__super__.getProps.apply(this, arguments), p);
        }
        if (((ref2 = this.__proto__) != null ? ref2.getProps : void 0) != null) {
          p = _.extend({}, this.__proto__.getProps(), p);
        }
        return _.extend(p, this.props);
      };

      WebComponent.prototype.getAttrs = function() {
        var a, key, r, ref2, ref3, value;
        a = {};
        if (this.__super__ != null) {
          a = _.extend({}, WebComponent.__super__.getAttrs.apply(this, arguments), a);
        }
        if (((ref2 = this.__proto__) != null ? ref2.getAttrs : void 0) != null) {
          a = _.extend({}, this.__proto__.getAttrs(), a);
        }
        r = {};
        ref3 = _.extend(a, this.attrs);
        for (key in ref3) {
          value = ref3[key];
          if (!key.startsWith('on-')) {
            r[key] = value;
          }
        }
        return r;
      };

      WebComponent.prototype.getEvents = function() {
        var e, key, r, ref2, ref3, ref4, value;
        e = {};
        if (this.__super__ != null) {
          e = _.extend({}, WebComponent.__super__.getEvents.apply(this, arguments), e);
        }
        if (((ref2 = this.__proto__) != null ? ref2.getEvents : void 0) != null) {
          e = _.extend({}, this.__proto__.getEvents(), e);
        }
        r = {};
        ref3 = _.extend(e, this.attrs);
        for (key in ref3) {
          value = ref3[key];
          if (key.startsWith('on-')) {
            r[key] = value;
          }
        }
        ref4 = this.events;
        for (key in ref4) {
          value = ref4[key];
          r[key] = value;
        }
        return r;
      };

      WebComponent.prototype.getClasses = function() {
        var c, ref2;
        c = [];
        if (this.__super__ != null) {
          c = _.extend([], WebComponent.__super__.getClasses.apply(this, arguments), c);
        }
        if (((ref2 = this.__proto__) != null ? ref2.getClasses : void 0) != null) {
          c = _.extend([], this.__proto__.getClasses(), c);
        }
        return _.extend(c, this.classes);
      };

      WebComponent.prototype.css = {};

      WebComponent.prototype.props = {};

      WebComponent.prototype.attrs = {};

      WebComponent.prototype.events = {};

      WebComponent.prototype.classes = [];

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
