{ BaseView } = TOS
{ div, span, i } = TOS.html

TOS.ButtonView = class ButtonView extends BaseView

  classes: [
    'btn'
    'disable-text-selection'
  ]

  attrs:
    icon: false
    label: false
    primary: false
    success: false
    error: false
    warning: false
    info: false
    'on-click': (e) -> console.log 'clicked', e

  ready: ->
    super
    @removeClass(['btn-primary', 'btn-success', 'btn-warning', 'btn-error', 'btn-info', 'btn-outline'])
    if @attr('primary')
      @addClass('btn-primary')
    else if @attr('success')
      @addClass('btn-success')
    else if @attr('warning')
      @addClass('btn-warning')
    else if @attr('error')
      @addClass('btn-error')
    else if @attr('info')
      @addClass('btn-info')
    else
      @addClass('btn-outline')

  render: (content) ->
    div [
      i "#icon.mr1.ic-#{@attr('icon')}" if @attr('icon')

      span '#label', @attr('label') if @attr('label')

      div '#content', [
        content
      ]
    ]

ButtonView.register()
