{ WebComponent, CustomEvent } = TOS
{ div, span, i, hr } = TOS.html

Keys = require('combokeys')


TOS.BaseView = class BaseView extends WebComponent

  css:
    ':host':
      'display': 'inline-block'

  attrs:
    vertical: false
    horizontal: false
    wrap: false
    center: false
    stretch: false
    start: false
    end: false
    justify: false
    small: false
    medium: false
    large: false
    grow: false
    auto: false
    none: false
    first: false
    last: false

  buildContentClass: ->
    c = ''
    if @attr('horizontal') then c += '.flex'
    if @attr('vertical') then c += '.flex.flex-column'
    if c.indexOf('.flex') != -1
      if @attr('wrap') then c += '.flex-wrap'
      if @attr('center') then c += '.flex-center'
      if @attr('stretch') then c += '.flex-stretch'
      if @attr('start') then c += '.flex-start'
      if @attr('end') then c += '.flex-end'
      if @attr('justify') then c += '.flex-justify'
      if @attr('small') then c += '.sm-flex'
      if @attr('medium') then c += '.md-flex'
      if @attr('large') then c += '.lg-flex'
      if @attr('grow') then c += '.flex-grow'
      if @attr('auto') then c += '.flex-auto'
      if @attr('none') then c += '.flex-none'
      if @attr('first') then c += '.flex-first'
      if @attr('last') then c += '.flex-last'
    return c

  key: (sequence, callback) ->
    if !@_keys?
      @_keys = new Keys(@)

    fn = (e) =>
      if @focused()
        callback.apply(@, arguments)
        e.stopPropagation()

    @_keys.bind(sequence, fn)


  render: (content) ->
    div @buildContentClass(), [content]


BaseView.register()
