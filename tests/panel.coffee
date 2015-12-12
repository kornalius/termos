{ WebComponent, PanelView } = TOS
{ div, span } = TOS.html

class TestPanel extends PanelView

  css:
    ':host':
      display: 'inline-block'
      margin: '4px'

  attrs:
    title: 'SAMPLE TITLE'

  render: (content) ->
    super [
      span 'Some content for this wonderful panel view component'
      span 'Some more content'
      content
    ]


TestPanel.register()

c = TOS.createElement('test-panel', icon: 'checkmark')
document.body.appendChild c
