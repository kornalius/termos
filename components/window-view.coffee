{ BaseView } = TOS
{ div, span, i, hr } = TOS.html

TOS.WindowView = class WindowView extends BaseView

  css:
    ':host':
      '.window':
        height: '24px'

  attrs:
    icon: false
    title: false
    closable: true
    resizable: true
    moveable: true
    minimizable: true
    maximizable: true

  render: (content) ->
    div '.window.flex.flex-stretch', [

      div '.p1.title', [
        i "#icon.mr1.h3.ic-#{@attr('icon')}" if @attr('icon')
        span '#title.h4.bold', @attr('title') if @attr('title')
      ]

      div '#content.fullscreen', [
        content
      ]
    ]

WindowView.register()
