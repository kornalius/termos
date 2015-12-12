{ div, span } = TOS.html

class MyBaseComponent extends TOS.WebComponent

  css:
    ':host':
      color: 'red'
    'span':
      'font-weight': 'bold'

  props:
    prop1: false

  attrs:
    attr1: true

  created: ->
    console.log "base created", @

  attached: ->
    console.log "base attached", @

  render: (content) ->
    super div [
      content
      span ' WORLD!'
    ]

MyBaseComponent.register()


class MyComponent extends MyBaseComponent

  css:
    ':host':
      color: 'orange'
    'span':
      'font-style': 'italic'

  props:
    prop1: true

  attrs:
    attr2: 'Some Value'

  created: ->
    super
    console.log "created", @

  attached: ->
    super
    console.log "attached", @

  render: ->
    super span @prop1

MyComponent.register()


# c = TOS.html.myComponent()
c = document.createElement('my-component')
document.body.appendChild c
c.prop1 = "HELLO"
