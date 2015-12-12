{ WebComponent } = TOS
{ div, span, i, hr } = TOS.html

TOS.PanelViewEdit = class PanelViewEdit

  css:
    ':host[editmode]':
      'outline': '2px solid blue'

  attrs:
    editMode: false

  # render: (content) ->
    # content

  edit: ->
    @attr('editmode', '')

  isEdit: ->
    @hasAttr('editmode')

  toggleEdit: ->
    if @isEdit()
      @cancelEdits()
    else
      @edit()

  saveEdits: ->
    @removeAttr('editmode')

  cancelEdits: ->
    @removeAttr('editmode')
