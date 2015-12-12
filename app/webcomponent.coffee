{ create, diff, patch, VNode, VText } = require('virtual-dom')

fromHTML = require('html-to-vdom')(VNode: VNode, VText: VText)
toHTML = require('vdom-to-html')
isVNode = require('virtual-dom/vnode/is-vnode')
isVText = require('virtual-dom/vnode/is-vtext')
isThunk = require('virtual-dom/vnode/is-thunk')
ccss = require('ccss')
raf = require('raf')
{ PathObserver, ArrayObserver, ObjectObserver, hasObjectObserve, CompoundObserver, Path, ObserverTransform } = require('observe-js')


elements = [
  'html','head','title','base','link','meta','style','script',
  'noscript','body','section','nav','article','aside','h1','h2',
  'h3','h4','h5','h6','hgroup','header','footer','address','main',
  'p','hr','pre','blockquote','ol','ul','li','dl','dt','dd',
  'figure','figcaption','div','a','em','strong','small','s','cite',
  'q','dfn','abbr','data','time','code','var','samp','kbd','sub',
  'sup','i','b','u','mark','ruby','rt','rp','bdi','bdo','span','br',
  'wbr','ins','del','img','iframe','embed','object','param','video',
  'audio','source','track','canvas','map','area','svg','math',
  'table','caption','colgroup','col','tbody','thead','tfoot','tr',
  'td','th','form','fieldset','legend','label','input','button',
  'select','datalist','optgroup','option','textarea','keygen',
  'output','progress','meter','details','summary','command','menu'
]

isEmpty = {
  'area': true, 'base': true, 'br': true, 'col': true, 'hr': true,
  'img': true, 'input': true, 'link': true, 'meta': true,
  'param': true, 'embed': true
}


escape = (s) ->
  s = ('' + s); # Coerce to string
  s = s.replace(/&/g, '&amp;')
  s = s.replace(/</g, '&lt;')
  s = s.replace(/>/g, '&gt;')
  s = s.replace(/"/g, '&quot;')
  s = s.replace(/'/g, '&#39;')
  return s


attrPairs = (obj) ->
  r = []
  for k of obj
    if obj.hasOwnProperty(k)
      r.push [k, obj[k]]
  return r


stringifyAttr = (k, v) -> "#{escape(k)}=\"#{escape(v)}\""


stringifyAttrs = (attrs) ->
  pairs = attrPairs(attrs)
  r = []
  for i in [0...pairs.length]
    r.push stringifyAttr(pairs[i][0], pairs[i][1])
  return r.join(' ')


parseAttrs = (str) ->
  classes = []
  ids = []
  customs = []
  buffer = null

  createBuffer = (type) ->
    buffer = { type: type, chars: '' }

  pushBuffer = ->
    if buffer.type == 'class'
      classes.push buffer.chars
    else if buffer.type == 'id'
      ids.push buffer.chars
    else if buffer.type == 'attr'
      customs.push buffer.chars
    buffer = null

  for i in [0...str.length]
    ch = str[i]
    switch ch
      when '.'
        if buffer?
          pushBuffer()
        createBuffer('class')

      when '#'
        if buffer?
          pushBuffer()
        createBuffer('id')

      when '@'
        if buffer?
          pushBuffer()
        createBuffer('attr')

      else
        if !buffer?
          throw new Error("Malformed attribute string: \"#{str}\"")
        buffer.chars += ch

  if buffer?
    pushBuffer()

  attrs = {}
  if ids.length
    attrs.id = ids.join(' ')

  if classes.length
    attrs['class'] = classes.join(' ')

  if customs.length
    for c in customs
      attrs[c] = ''

  return attrs


stringifyContents = (contents) ->
  if _.isArray(contents)
    str = ''
    for c in contents
      str += stringifyContents(c)
    return str

  else if _.isFunction(contents)
    r = contents.call(@)
    if !r?
      r = ''
    return r

  else if contents?
    return contents.toString()

  else
    return ''


isSelector = (string) -> string.length > 1 and string.charAt(0) in ['#', '.']


createElementFn = (tag, empty) ->
  (attrs, contents) ->

    selector = if _.isString(attrs) then isSelector(attrs) else false

    if _.isString(attrs) and _.isArray(contents)

    else if _.isString(attrs) and !selector
      contents = attrs
      attrs = null

    else if _.isArray(attrs)
      contents = attrs
      attrs = null

    attrs = attrs or {}

    if _.isString(attrs) and selector
      attrs = parseAttrs(attrs)

    attrstr = stringifyAttrs(attrs)

    inner = stringifyContents(contents)

    if empty
      # if !_.isEmpty(inner)
        # throw new Error('Contents provided for empty tag type')
      return "<#{tag}#{if attrstr?.length then ' ' + attrstr else ''}/>"
    else
      return "<#{tag}#{if attrstr?.length then ' ' + attrstr else ''}>#{inner}</#{tag}>"

# Export tag functions
html = {}
for tag in elements
  html[tag] = createElementFn(tag, isEmpty[tag])


S_NONE = 0
S_INITIALIZING = 1
S_RENDERING = 2

_toRender = []
_status = S_NONE


raf _renderAll = ->

  _status = S_RENDERING
  if _toRender.length
    t = _.clone(_toRender)
    _toRender.length = 0
    for r in t
      r._dom()
  _status = S_NONE

  raf _renderAll


_classify = (name) ->
  _.capitalize(_.camelize(name))


_isElementRegistered = (name) ->
  _elementConstructor(name) != HTMLElement


_elementConstructor = (name) ->
  document.createElement(name).constructor


_createElement = (name, attrs) ->
  el = document.createElement(name)
  for key, value of attrs
    el.setAttribute(key, if value == true then '' else value.toString())
  return el


_appendElement = (name, selector, attrs) ->
  el = _createElement(name, attrs)
  $(selector).appendChild(el)
  return el


moduleKeywords = ['extended', 'included', '_renderFns']


module.exports =
  raf: raf
  ccss: ccss
  html: html

  toRender: _toRender
  status: -> _status

  vdom:
    create: create
    diff: diff
    patch: patch
    VNode: VNode
    VText: VText
    fromHTML: fromHTML
    toHTML: toHTML
    isVNode: isVNode
    isVText: isVText
    isThunk: isThunk

  isElementRegistered: _isElementRegistered
  elementConstructor: _elementConstructor
  createElement: _createElement
  appendElement: _appendElement

  css:
    none: 'none'
    auto: 'auto'
    inherit: 'inherit'
    hidden: 'hidden'
    pointer: 'pointer'
    normal: 'normal'
    block: 'block'
    transparent: 'transparent'
    absolute: 'absolute'
    relative: 'relative'
    baseline: 'baseline'
    center: 'center'
    middle: 'middle'
    top: 'top'
    left: 'left'
    bottom: 'bottom'
    right: 'right'

    rgb: (red, green, blue) -> "rgb(#{red}, #{green}, #{blue})"

    rgba: (red, green, blue, opacity) -> "rgba(#{red}, #{green}, #{blue}, #{opacity})"

    em: ->
      r = []
      for a in arguments
        r.push(a + 'em')
      r.join(' ')

    rem: ->
      r = []
      for a in arguments
        r.push(a + 'rem')
      r.join(' ')

    px: ->
      r = []
      for a in arguments
        r.push(a + 'px')
      r.join(' ')

    important: -> Array.prototype.slice.call(arguments).join(' ') + ' !important'


  WebComponent: class WebComponent extends HTMLElement


    @register: ->
      dname = _.dasherize(@name)
      if !_isElementRegistered(dname)
        _status = S_INITIALIZING
        cname = _.camelize(@name)
        proto = Object.create(@prototype.constructor).prototype
        proto._componentName = cname
        proto._elementName = dname
        e = document.registerElement(dname, prototype: proto)
        html[cname] = createElementFn(dname, false)
        _status = S_NONE


    include: (obj) ->
      proto = @constructor.prototype
      for key, value of obj when key not in moduleKeywords
        if _.isPlainObject(proto[key]) and _.isPlainObject(value)
          _.deepExtend(proto[key], value)
        else if _.isFunction(value) and key == 'render'
          if !proto._renderFns?
            proto._renderFns = []
          k = key + proto._componentName
          proto[k] = value
          proto._renderFns.push(k)
        else
          proto[key] = value
      # obj.included?.apply(@)
      return @


    createdCallback: ->
      @isReady = false
      @isAttached = false
      @_vdom = null
      @_vdom_style = null
      @_observers = []

      if _status != S_INITIALIZING
        if @created?
          @created()
        uuid = _.uniqueId()
        @_uniqueId = uuid
        @classList.add("#{@_elementName}-#{uuid}")

      @_prepare()


    _bindInputs: ->
      return if _status == S_INITIALIZING

      that = @

      $(@_el).find('input').each (el) ->
        el = $(el)
        path = el.attr('bind')
        if path? and _.valueForKeyPath(that, path)?
          if !el.attr('type')?
            el.attr('type', 'text')

          switch el.attr('type').toLowerCase()
            when 'checkbox'
              el.on('change', (e) ->
                _.setValueForKeyPath(that, path, el[0].checked)
              )
              el[0].checked = _.valueForKeyPath(that, path)

            when 'radio'
              el.on('change', (e) ->
                _.setValueForKeyPath(that, path, el[0].checked)
              )
              el[0].checked = _.valueForKeyPath(that, path)

            else
              el.on('keyup', (e) ->
                _.setValueForKeyPath(that, path, el[0].value)
              )
              el[0].value = _.valueForKeyPath(that, path)


    _removeEvents: ->
      $(@_el).off()


    # _createEvents: ->
    #   return if _status == S_INITIALIZING

    #   for key, value of @getEvents()
    #     debugger;
    #     $(@_el).on(key, value.bind())


    _createEvents: ->
      return if _status == S_INITIALIZING

      for key, value of @getEvents()
        key = key.substr(3)
        if !value?
          $(@_el).off(key)
        else if _.isFunction(value)
          $(@_el).on(key, value.bind(@))
        else if _.isString(value)
          fn = @methods[value]
          if _.isFunction(fn)
            $(@_el).on(key, fn.bind(@))
          else
            $(@_el).on(key, new Function(['event'], value).bind(@))


    _createClasses: ->
      return if _status == S_INITIALIZING

      for c in @getClasses()
        @classList.add(c)


    _createAttrs: ->
      return if _status == S_INITIALIZING

      for key, value of @getAttrs()
        if !@hasAttribute(key) and value? and value != false
          @setAttribute(key, if value == true then '' else value.toString())


    _observe: (path, fn) ->
      if path?
        observer = new PathObserver(@, path)
        observer.open (newValue, oldValue) ->
          # console.log "OBSERVE: #{path} changed from #{oldValue} to #{newValue}"
          fn.call(@, {observer: observer, path: path, newValue: newValue, oldValue: oldValue}) if fn?

      else if _.isArray(@)
        observer = new ArrayObserver(@)
        observer.open (splices) ->
          for splice in splices
            # if splice.removed?
              # console.log "OBSERVE: #{cson.stringify(removed)} removed at #{splice.index}"
            # else
              # console.log "OBSERVE: #{cson.stringify(@.slice(splice.index, splice.addedCount))} added at #{splice.index}"
            fn.call(@, {observer: observer, path: path, slices: splices}) if fn?

      else if _.isObject(@) and _.keys(@).length
        observer = new ObjectObserver(@)
        observer.open (added, removed, changed, getOldValueFn) ->
          # for k, v of added
            # console.log "OBSERVE: #{k} = #{v} added"
          # for k, v of removed
            # console.log "OBSERVE: #{k} removed (#{getOldValueFn(k)})"
          # for k, v of changed
            # console.log "OBSERVE: #{k} = #{v} changed (#{getOldValueFn(k)})"
          fn.call(@, {observer: observer, path: path, added: added, removed: removed, changed: changed, getOldValueFn: getOldValueFn}) if fn?

      @_observers.push observer
      observer.instance = @
      return observer


    _createIds: ->
      return if _status == S_INITIALIZING

      that = @
      @$ = {}

      _createElementIds = (el) ->
        for e in el.childNodes
          if !_.isEmpty(e.id)
            that.$[_.camelize(e.id)] = e
          _createElementIds(e)

      _createElementIds(@_el)


    _prepare: ->
      @_dom()

      if @_el_style?
        document.head.appendChild(@_el_style)

      if @_el?
        @appendChild(@_el)


    _observeProps: ->
      return if _status == S_INITIALIZING

      for k, v of @getProps()
        @[k] = v
        @_observe(k, (=> @invalidate()))


    attachedCallback: ->
      if @ready?
        @ready()

      @isReady = true

      @_removeEvents()
      @_bindInputs()
      @_createClasses()
      @_createAttrs()
      @_createEvents()

      @_createIds()

      @_observeProps()

      @_dom()
      if _.contains(_toRender, @)
        _.remove(_toRender, @)

      if @attached?
        @attached()

      @isAttached = true


    detachedCallback: ->
      @_removeEvents()

      for o in @_observers
        o.close()
      @_observers = []

      if @detached?
        @detached()

      @isAttached = false


    attributeChangedCallback: (name, oldValue, newValue) ->
      # console.log "attributeChanged:", "#{@tagName.toLowerCase()}#{if !_.isEmpty(@id) then '#' + @id else ''}#{if !_.isEmpty(@className) then '.' + @className else ''}", name, oldValue, '->', newValue
      if @isAttached
        @invalidate()


    _dom: ->
      return if _status == S_INITIALIZING

      uuid = @_uniqueId or _.uniqueId()

      css = {}
      for key, value of @getCSS()
        if key.match(/\:host/gi)
          key = key.replace(/\:host/gi, ".#{@_elementName}-#{uuid}")
        else
          key = ".#{@_elementName}-#{uuid} #{key}"
        css[key] = value

      style = ccss.compile(css)
      vs = fromHTML("<style>#{style}</style>")
      if !@_vdom_style?
        @_el_style = create(vs)
      else
        patches = diff(@_vdom_style, vs);
        @_el_style = patch(@_el_style, patches);
      @_vdom_style = vs;

      html = @render()
      v = fromHTML(html)
      if !@_vdom?
        @_el = create(v)
      else
        patches = diff(@_vdom, v);
        @_el = patch(@_el, patches);
      @_vdom = v;

      if @updated?
        @updated()


    invalidate: ->
      console.log "invalidate", @, _toRender
      if !_.contains(_toRender, @)
        _toRender.push(@)


    invalidated: ->
      return _.contains(_toRender, @)


    getCSS: ->
      c = {}
      if @__super__?
        c = _.deepExtend({}, super, c)
      if @__proto__?.getCSS?
        c = _.deepExtend({}, @__proto__.getCSS(), c)
      _.deepExtend({}, c, @css)


    getProps: ->
      p = {}
      if @__super__?
        p = _.extend({}, super, p)
      if @__proto__?.getProps?
        p = _.extend({}, @__proto__.getProps(), p)
      _.extend(p, @props)


    getAttrs: ->
      a = {}
      if @__super__?
        a =_.extend({}, super, a)
      if @__proto__?.getAttrs?
        a = _.extend({}, @__proto__.getAttrs(), a)
      r = {}
      for key, value of _.extend(a, @attrs)
        if !key.startsWith('on-')
          r[key] = value
      return r


    getEvents: ->
      e = {}
      if @__super__?
        e =_.extend({}, super, e)
      if @__proto__?.getEvents?
        e =_.extend({}, @__proto__.getEvents(), e)
      r = {}
      for key, value of _.extend(e, @attrs)
        if key.startsWith('on-')
          r[key] = value
      for key, value of @events
        r[key] = value
      return r


    getClasses: ->
      c = []
      if @__super__?
        c = _.extend([], super, c)
      if @__proto__?.getClasses?
        c = _.extend([], @__proto__.getClasses(), c)
      _.extend(c, @classes)


    css: {}


    props: {}


    attrs: {}


    events: {}


    classes: []


    created: ->


    ready: ->


    attached: ->


    detached: ->


    updated: ->


    render: (content) ->
      html = ''

      if _.isFunction(content)
        html = content.call(@)
      else if _.isArray(content)
        html = stringifyContents(content)
      else if _.isString(content)
        html = content

      # if @_renderFns?
        # for r in @_renderFns
          # html = @[r].call(@, $().html(html))

      return if _.isEmpty(html) then '<div></div>' else html
