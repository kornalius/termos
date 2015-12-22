{ WebComponent, Plugin } = TOS
{ div, span } = TOS.html


class CSSEntity extends Plugin

  css:
    ':host':
      color: 'blue'

  props:
    prop1: 567
    prop3: 8792


class PropsEntity extends Plugin

  props:
    prop1: 23849
    prop3: 238

  attached: ->
    console.log "attached PropsEntity", @

  render: (content) ->
    div "render PropsEntity"


class AttrsEntity extends Plugin

  attrs:
    attr1: "Nice Job"
    attr2: "Attribute Value"
    attr4: "Added"

  attached: ->
    console.log "attached AttrsEntity", @

  render: (content) ->
    div "render AttrsEntity"


class MyComponent2 extends WebComponent

  css:
    ':host':
      color: 'red'
    'span':
      'font-weight': 'bold'

  attrs:
    attr1: true
    attr2: "Some kind of value"
    attr3: "Another one"

  props:
    prop1: 124
    prop2: 543

  created: ->
    # @async ( => PropsEntity.uninstall(@__proto__.constructor); debugger; @_createAttrs(); @invalidate(); ), 2000

  attached: ->
    console.log "attached MyComponent2", @

  render: (content) ->
    div [
      content
      span @attr 'attr2'
    ]

  PropsEntity.install @
  AttrsEntity.install @
  CSSEntity.install @


MyComponent2.register()


c = document.createElement('my-component2')
document.body.appendChild c
