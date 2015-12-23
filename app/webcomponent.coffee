{ create, diff, patch, VNode, VText } = require('virtual-dom')

PropertyAccessors = require 'property-accessors'
EventEmitter = require 'eventemitter3'

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


# attrPairs = (obj) ->
#   r = []
#   for k of obj
#     if obj.hasOwnProperty(k)
#       r.push [k, obj[k]]
#   return r


# stringifyAttr = (k, v) ->
#   if _.isUndefined(v) or _.isNull(v)
#     return null
#   else
#     if v == true
#       return "#{escape(k)}"
#     else
#       return "#{escape(k)}=\"#{escape(v)}\""


# stringifyAttrs = (attrs) ->
#   pairs = attrPairs(attrs)
#   r = []
#   for i in [0...pairs.length]
#     s = stringifyAttr(pairs[i][0], pairs[i][1])
#     if !_.isNull(s)
#       r.push s
#   return r.join(' ')


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


# stringifyContents = (contents) ->
#   if _.isArray(contents)
#     str = ''
#     for c in contents
#       str += stringifyContents(c)
#     return str

#   else if _.isFunction(contents)
#     r = contents.call(@)
#     if !r?
#       r = ''
#     return r

#   else if contents?
#     return contents.toString()

#   else
#     return ''


processContents = (contents) ->
  r = []

  if _.isArray(contents)
    for c in contents when c?
      rc = processContents(c)
      if _.isArray(rc)
        if rc.length == 1
          rc = rc[0]
        else if rc.length == 0
          rc = null
      r.push rc if rc?

  else if _.isFunction(contents)
    r = contents.call(@)

  else if _.isString(contents)
    r = new VText(contents)

  else if contents instanceof VNode or contents instanceof VText
    r = contents

  return if _.isArray(r) then r else [r]


isSelector = (string) -> _.isString(string) and string.length > 1 and string.charAt(0) in ['#', '.']


createElementFn = (tag, proto, empty) ->
  (attrs, contents) ->

    if _.isArray(attrs)
      contents = attrs
      attrs = null

    selector = isSelector(attrs)

    if _.isString(attrs)
      if selector
        attrs = parseAttrs(attrs)
      else
        contents = attrs
        attrs = null

    attrs = {} if !_.isPlainObject(attrs)

    if _.isPlainObject(contents)
      _.extend attrs, contents
      contents = null

    # attrs = attrs or {}

    # attrstr = stringifyAttrs(attrs)

    # inner = stringifyContents(contents)

    inner = processContents(contents)

    keys = if proto?.props? then _.keys(proto.props) else []
    properties = _.pick(attrs, (v, k) -> _.contains(keys, k))
    properties.attributes = _.pick(attrs, (v, k) -> !_.contains(keys, k))

    return new VNode(tag, properties, inner)

    # if empty
      # # if !_.isEmpty(inner)
        # # throw new Error('Contents provided for empty tag type')
      # return "<#{tag}#{if attrstr?.length then ' ' + attrstr else ''}/>"
    # else
      # return "<#{tag}#{if attrstr?.length then ' ' + attrstr else ''}>#{inner}</#{tag}>"

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


_createElement = (name, attrs) -> document.createElement(name, attrs)


_appendElement = (name, selector, attrs) ->
  el = _createElement(name, attrs)
  $(selector).appendChild(el)
  return el


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
    PropertyAccessors.includeInto @

    @register: ->
      dname = _.dasherize(@name)
      if !_isElementRegistered(dname)
        _status = S_INITIALIZING
        cname = @name.toLowerCase()
        proto = Object.create(@prototype.constructor).prototype
        # if @__super__?
          # proto.__$super__ = @__super__
        proto._componentName = cname
        proto._elementName = dname
        e = document.registerElement(dname, prototype: proto)
        html[cname] = createElementFn(dname, proto, false)
        _status = S_NONE


    createdCallback: ->
      _.extend @__proto__, EventEmitter.prototype

      @isReady = false
      @isAttached = false
      @_vdom = null
      @_vdom_style = null
      @_observers = []

      if _status != S_INITIALIZING
        @_uniqueId = _.uniqueId()
        @classList.add("#{@_elementName}-#{@_uniqueId}")
        if @created?
          @created()

      @_prepare()

      # if _status != S_INITIALIZING
      #   if _componentProps[@_uniqueId]?
      #     debugger;
      #     for k, v of _componentProps[@_uniqueId]
      #       @[k] = v
      #     delete _componentProps[@_uniqueId]


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
        if key == 'title'
          debugger;

        if value? and value != false and !@hasAttribute(key)
          @setAttribute(key, if value == true then '' else value.toString())


    _observeProps: ->
      return if _status == S_INITIALIZING

      for o in @_observers
        o.close()
      @_observers = []

      that = @
      for k, v of @getProps()
        @[k] = v
        @_observe(k, (e) ->
          n = "#{k}Changed"
          if that[n]?
            that[n].call that, n, e.newValue
          that.invalidate()
        )


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

      @_removeEvents()
      @_bindInputs()
      @_createClasses()
      @_createAttrs()
      @_createEvents()
      @_observeProps()

      if @_el_style?
        document.head.appendChild(@_el_style)

      if @_el?
        @appendChild(@_el)

      @_createIds()


    attachedCallback: ->
      if @ready?
        @ready()

      @isReady = true

      @_dom()

      @_removeEvents()
      @_bindInputs()
      @_createClasses()
      @_createAttrs()
      @_createEvents()
      @_observeProps()

      if _.contains(_toRender, @)
        _.remove(_toRender, @)

      if @attached?
        @attached()

      @isAttached = true


    focused: -> document.activeElement == @


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
      if @[name + 'Changed']?
        @[name + 'Changed'].call(@, newValue, oldValue)
      if @isAttached
        @invalidate()


    _dom: ->
      return if _status == S_INITIALIZING

      uuid = @_uniqueId

      if uuid?
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

        # html = @render()
        # if _.isFunction(html)
        #   html = html.call(@)
        # if _.isArray(html)
        #   html = "<div>#{stringifyContents(html)}</div>"
        # if _.isEmpty(html)
        #   html = '<div></div>'
        # v = fromHTML(html)

        v = @render()

        if _.isArray(v) or !v?
          v = new VNode('div', {}, v)

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
      # if @__$super__?.getCSS?
        # _.deepExtend(c, @__$super__.getCSS())
      if @__proto__?.getCSS?
        _.deepExtend(c, @__proto__.getCSS())
      if @hasOwnProperty('css')
        _.deepExtend(c, @css)
      return c


    getProps: ->
      p = {}
      # if @__$super__?.getProps?
        # _.extend(p, @__$super__.getProps())
      if @__proto__?.getProps?
        _.extend(p, @__proto__.getProps())
      if @hasOwnProperty('props')
        _.extend(p, @props)
      return p


    getAttrs: ->
      a = {}
      # if @__$super__?.getAttrs?
      #   _.extend(a, @__$super__.getAttrs())
      if @__proto__?.getAttrs?
        _.extend(a, @__proto__.getAttrs())
      if @hasOwnProperty('attrs')
        _.extend(a, @attrs)
      r = {}
      for key, value of a
        if !key.startsWith('on-')
          r[key] = value
      return r


    getEvents: ->
      e = {}
      # if @__$super__?.getEvents?
        # _.extend(e, @__$super__.getEvents())
      if @__proto__?.getEvents?
        _.extend(e, @__proto__.getEvents())
      if @hasOwnProperty('events')
        _.extend(e, @events)
      r = {}
      for key, value of @getAttrs()
        if key.startsWith('on-')
          r[key] = value
      for key, value of e
        r[key] = value
      return r


    getClasses: ->
      c = []
      # if @__$super__?.getClasses?
        # _.extend(c, @__$super__.getClasses())
      if @__proto__?.getClasses?
        _.extend(c, @__proto__.getClasses())
      if @hasOwnProperty('classes')
        _.extend(c, @classes)
      return c


    # css: {}


    # props: {}


    # attrs: {}


    # events: {}


    # classes: []


    created: ->


    ready: ->


    attached: ->


    detached: ->


    updated: ->


    render: -> '<div></div>'

