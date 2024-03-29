{ BaseView, PanelViewEdit } = TOS
{ div, span, i, hr } = TOS.html

TOS.PanelView = class PanelView extends BaseView

  # css:
    # ':host':

  attrs:
    icon: false
    label: false
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
    cnt = []

    if @attr('icon')
      ruler = true
      cnt.push i "#icon.mr1.h3.ic-#{@attr('icon')}"

    if @attr('label')
      ruler = true
      cnt.push span '#label.h4.bold', @attr('label')

    if ruler
      cnt.push hr()

    cnt.push div '#content', content

    div '.shadow-1.p1', cnt

  PanelViewEdit.install @


PanelView.register()
