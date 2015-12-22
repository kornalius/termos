Element.prototype.hasClass = (name) -> _.contain(@classList, name)

Element.prototype.addClass = (name) -> @classList.add(name)

Element.prototype.removeClass = (name) -> @classList.remove(name)

Element.prototype.toggleClass = (name) ->
  if @hasClass(name)
    @removeClass(name)
  else
    @addClass(name)

Element.prototype.toggleVisibility = ->
  visibility = @getStyle('visibility')
  if visibility == 'visible'
    @style.visibility = 'hidden'
  else
    @style.visibility = 'visible'

Element.prototype.attr = (name, value) ->
  if !_.isUndefined(value)
    if value == false
      @removeAttribute(name)
    else
      @setAttribute(name, value)
  r = null
  if @hasAttribute(name)
    r = @getAttribute(name)
    if r == ''
      r = true
  return r

Element.prototype.hasAttr = (name) -> @hasAttribute(name)

Element.prototype.removeAttr = (name) -> @removeAttribute(name)

Element.prototype.toggleAttr = (name) ->
  if @hasAttr(name)
    @removeAttr(name)
  else
    @addAttr(name)

Element.prototype.getStyle = (styleProp) ->
  return document.defaultView.getComputedStyle(@, null).getPropertyValue(styleProp)

Element.prototype.empty = -> @innerHTML = ''

Element.prototype.text = (value) ->
  if !_.isUndefined(value)
    @textContent = value
  @textContent

Element.prototype.val = (value) ->
  if !_.isUndefined(value)
    @value = value
  @value

Element.prototype.appendTo = (element) ->
  context = if _.isString(element) then document.querySelector(element) else element
  element.appendChild(@)

Element.prototype.html = (fragment) ->
  if !_.isUndefined(fragment)
    if _.isElement(fragment)
      fragment = fragment.outerHTML
    @innerHTML = fragment
  @innerHTML

Element.prototype.closest = (selector) ->
  nodes = []
  node = @parentElement
  while node
    if node.matches(selector)
      return node
    node = node.parentElement
  return null

Element.prototype.$ = (selector) ->
  @querySelector(selector)

Element.prototype.$$ = (selector) ->
  Array.from(@querySelectorAll(selector))

Element.prototype.css = (key, value) ->
  if _.isString(key)
    key = _.camelize(key)
    if !value?
      val = @getStyle(key)
      return if _.isNumeric(val) then parseFloat(val) else val
    else
      styleProps = {}
      styleProps[key] = value
  else
    styleProps = key
    for prop of styleProps
      val = styleProps[prop]
      delete styleProps[prop]
      styleProps[_.camelize(prop)] = val

  for prop of styleProps
    if styleProps[prop]?
      @style[prop] = styleProps[prop]
    else
      @style.removeProperty(_.dasherize(prop))

Object.defineProperty(Element.prototype, 'x',
  get: -> @clientLeft
  set: (value) -> @style.left = value + 'px'
)

Object.defineProperty(Element.prototype, 'y',
  get: -> @clientTop
  set: (value) -> @style.top = value + 'px'
)

Object.defineProperty(Element.prototype, 'z',
  get: -> @getStyle('z-index')
  set: (value) -> @style.zIndex = value
)

Object.defineProperty(Element.prototype, 'width',
  get: -> @clientWidth
  set: (value) -> @style.width = value + 'px'
)

Object.defineProperty(Element.prototype, 'height',
  get: -> @clientHeight
  set: (value) -> @style.height = value + 'px'
)

Object.defineProperty(Element.prototype, 'opacity',
  get: -> @getStyle('opacity')
  set: (value) -> @style.opacity = value
)


oldDocumentCreateElement = document.__proto__.createElement
window.document.__proto__.createElement = (tag, attrs) ->
  el = oldDocumentCreateElement.call(document, tag)
  props = el.props
  for k, v of attrs
    if props?[k]?
      el[k] = v
    else
      el.attr(k, v)
  return el

window.loadCSS = (path, name, macros) ->
  fs = require('fs')
  el = document.createElement('style')
  if _.isPlainObject(name)
    macros = name
    name = null
  if name?
    el.id = name
  s = fs.readFileSync(path).toString()
  if macros?
    for k, v of macros
      s = s.replace(new RegExp('__' + k + '__', 'gim'), v)
  el.textContent = s
  document.head.appendChild(el)
  return el

window.unloadCSS = (name) ->
  for el in Array.from(document.head.querySelectorAll("style[id=#{name}"))
    el.remove() if el?


window.$ = require('domtastic')

_.extend(window.$.prototype, require('bean'))

window.$.prototype.constructor.create = (tag, attrs) -> $(document.createElement(tag, attrs))

window.$.fn.hasAttr = (name) ->
  ok = false
  _.each(@, (element) -> ok |= element.hasAttribute(name))
  return ok
