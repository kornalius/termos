{ BaseView, PanelViewEdit } = TOS
{ div, span, i, hr } = TOS.html

TOS.PanelView = class PanelView extends BaseView

  # css:
    # ':host':

  attrs:
    icon: false
    title: false
    closable: false
    resizable: false
    moveable: false
    autohide: false

    'on-click': ->
      @toggleEdit()

  created: ->
    super
    @async(@edit, 100)

  render: (content) ->
    ruler = false
    div '.shadow-1.p1', [

      if @attr('icon')
        ruler = true
        i "#icon.mr1.h3.ic-#{@attr('icon')}"

      if @attr('title')
        ruler = true
        span '#title.h4.bold', @attr('title')

      if ruler
        hr()

      div '#content', [
        content
      ]

    ]

  PanelViewEdit.install @

PanelView.register()
