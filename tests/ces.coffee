{ div, span } = TOS.html


class CSSEntity

  css:
    ':host':
      color: 'blue'

  props:
    prop1: 23849
    prop3: 238


class PropsEntity

  props:
    prop1: 23849
    prop3: 238


class AttrsEntity

  attrs:
    attr1: "Nice Job"
    attr2: "Attribute Value"
    attr4: "Added"

  attached: ->
    console.log "attached AttrsEntity", @


class MyComponent2 extends TOS.WebComponent

  created: ->
    @include PropsEntity::
    @include AttrsEntity::
    @include CSSEntity::
    super

  css:
    ':host':
      color: 'red'
    'span':
      'font-weight': 'bold'

  attrs:
    attr1: true
    attr2: true
    attr3: "Another one"

  props:
    prop1: 124
    prop2: 543

  render: (content) ->
    super div [
      content
      span $(@).attr('attr2')
    ]

MyComponent2.register()


c = document.createElement('my-component2')
document.body.appendChild c
