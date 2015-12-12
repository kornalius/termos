{ BaseView } = TOS
{ div } = TOS.html

Terminal = require './butterfly/term.coffee'

TOS.TerminalView = class TerminalView extends BaseView

  created: ->
    loadCSS './components/butterfly/term.css'

  _send: (data) ->
    # @write data
    # ws.send 'S' + data

  _ctl: (type, args...) ->
    params = args.join(',')
    # if type == 'Resize'
      # ws.send 'R' + params


  attached: ->
    @term_el = new Terminal(@_el, @_send, @_ctl)
    for k, fn of @term_el.__proto__
      if _.isFunction(fn) and !@__proto__[k]?
        @__proto__[k] = fn.bind(@term_el)


TerminalView.register()
