(function() {
  var oldDocumentCreateElement;

  Element.prototype.hasClass = function(name) {
    return _.contain(this.classList, name);
  };

  Element.prototype.addClass = function(name) {
    return this.classList.add(name);
  };

  Element.prototype.removeClass = function(name) {
    return this.classList.remove(name);
  };

  Element.prototype.toggleClass = function(name) {
    if (this.hasClass(name)) {
      return this.removeClass(name);
    } else {
      return this.addClass(name);
    }
  };

  Element.prototype.toggleVisibility = function() {
    var visibility;
    visibility = this.getStyle('visibility');
    if (visibility === 'visible') {
      return this.style.visibility = 'hidden';
    } else {
      return this.style.visibility = 'visible';
    }
  };

  Element.prototype.attr = function(name, value) {
    var r;
    if (!_.isUndefined(value)) {
      if (value === false) {
        this.removeAttribute(name);
      } else {
        this.setAttribute(name, value);
      }
    }
    r = null;
    if (this.hasAttribute(name)) {
      r = this.getAttribute(name);
      if (r === '') {
        r = true;
      }
    }
    return r;
  };

  Element.prototype.addAttr = function(name) {
    return this.setAttribute(name, '');
  };

  Element.prototype.hasAttr = function(name) {
    return this.hasAttribute(name);
  };

  Element.prototype.removeAttr = function(name) {
    return this.removeAttribute(name);
  };

  Element.prototype.toggleAttr = function(name) {
    if (this.hasAttr(name)) {
      return this.removeAttr(name);
    } else {
      return this.addAttr(name);
    }
  };

  Element.prototype.getStyle = function(styleProp) {
    return document.defaultView.getComputedStyle(this, null).getPropertyValue(styleProp);
  };

  Element.prototype.empty = function() {
    return this.innerHTML = '';
  };

  Element.prototype.text = function(value) {
    if (!_.isUndefined(value)) {
      this.textContent = value;
    }
    return this.textContent;
  };

  Element.prototype.val = function(value) {
    if (!_.isUndefined(value)) {
      this.value = value;
    }
    return this.value;
  };

  Element.prototype.appendTo = function(element) {
    var context;
    context = _.isString(element) ? document.querySelector(element) : element;
    return element.appendChild(this);
  };

  Element.prototype.html = function(fragment) {
    if (!_.isUndefined(fragment)) {
      if (_.isElement(fragment)) {
        fragment = fragment.outerHTML;
      }
      this.innerHTML = fragment;
    }
    return this.innerHTML;
  };

  Element.prototype.closest = function(selector) {
    var node, nodes;
    nodes = [];
    node = this.parentElement;
    while (node) {
      if (node.matches(selector)) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  Element.prototype.$ = function(selector) {
    return this.querySelector(selector);
  };

  Element.prototype.$$ = function(selector) {
    return Array.from(this.querySelectorAll(selector));
  };

  Element.prototype.css = function(key, value) {
    var prop, results, styleProps, val;
    if (_.isString(key)) {
      key = _.camelize(key);
      if (value == null) {
        val = this.getStyle(key);
        if (_.isNumeric(val)) {
          return parseFloat(val);
        } else {
          return val;
        }
      } else {
        styleProps = {};
        styleProps[key] = value;
      }
    } else {
      styleProps = key;
      for (prop in styleProps) {
        val = styleProps[prop];
        delete styleProps[prop];
        styleProps[_.camelize(prop)] = val;
      }
    }
    results = [];
    for (prop in styleProps) {
      if (styleProps[prop] != null) {
        results.push(this.style[prop] = styleProps[prop]);
      } else {
        results.push(this.style.removeProperty(_.dasherize(prop)));
      }
    }
    return results;
  };

  Object.defineProperty(Element.prototype, 'x', {
    get: function() {
      return this.clientLeft;
    },
    set: function(value) {
      return this.style.left = value + 'px';
    }
  });

  Object.defineProperty(Element.prototype, 'y', {
    get: function() {
      return this.clientTop;
    },
    set: function(value) {
      return this.style.top = value + 'px';
    }
  });

  Object.defineProperty(Element.prototype, 'z', {
    get: function() {
      return this.getStyle('z-index');
    },
    set: function(value) {
      return this.style.zIndex = value;
    }
  });

  Object.defineProperty(Element.prototype, 'width', {
    get: function() {
      return this.clientWidth;
    },
    set: function(value) {
      return this.style.width = value + 'px';
    }
  });

  Object.defineProperty(Element.prototype, 'height', {
    get: function() {
      return this.clientHeight;
    },
    set: function(value) {
      return this.style.height = value + 'px';
    }
  });

  Object.defineProperty(Element.prototype, 'opacity', {
    get: function() {
      return this.getStyle('opacity');
    },
    set: function(value) {
      return this.style.opacity = value;
    }
  });

  oldDocumentCreateElement = document.__proto__.createElement;

  window.document.__proto__.createElement = function(tag, attrs) {
    var el, k, props, v;
    el = oldDocumentCreateElement.call(document, tag);
    props = el.props;
    for (k in attrs) {
      v = attrs[k];
      if ((props != null ? props[k] : void 0) != null) {
        el[k] = v;
      } else {
        el.attr(k, v);
      }
    }
    return el;
  };

  window.loadCSS = function(path, name, macros) {
    var el, fs, k, s, v;
    fs = require('fs');
    el = document.createElement('style');
    if (_.isPlainObject(name)) {
      macros = name;
      name = null;
    }
    if (name != null) {
      el.id = name;
    }
    s = fs.readFileSync(path).toString();
    if (macros != null) {
      for (k in macros) {
        v = macros[k];
        s = s.replace(new RegExp('__' + k + '__', 'gim'), v);
      }
    }
    el.textContent = s;
    document.head.appendChild(el);
    return el;
  };

  window.unloadCSS = function(name) {
    var el, i, len, ref, results;
    ref = Array.from(document.head.querySelectorAll("style[id=" + name));
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      el = ref[i];
      if (el != null) {
        results.push(el.remove());
      } else {
        results.push(void 0);
      }
    }
    return results;
  };

  window.$ = require('domtastic');

  _.extend(window.$.prototype, require('bean'));

  window.$.prototype.constructor.create = function(tag, attrs) {
    return $(document.createElement(tag, attrs));
  };

  window.$.fn.hasAttr = function(name) {
    var ok;
    ok = false;
    _.each(this, function(element) {
      return ok |= element.hasAttribute(name);
    });
    return ok;
  };

}).call(this);
