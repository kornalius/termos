{ WebComponent, TerminalView } = TOS

class TestTerm extends TerminalView

  attached: ->
    super
    @writeln "This is a really nice demo of a very nice terminal called Butterfly written in CoffeeScript"


TestTerm.register()

c = TOS.createElement('test-term')
document.body.appendChild c
