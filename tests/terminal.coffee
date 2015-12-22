{ WebComponent, TerminalView, app } = TOS


class TestTerm extends TerminalView

  attached: ->
    super

    @writeln ""
    @write @col.bgRed(" Welcome to termOS " + @col._190('v' + @col.italic(app.getVersion()) + ' ')) + ' '

    @writeln ""
    @writeln @col.gray("io.js: #{process.version}")
    @writeln @col.gray("electron: v#{process.versions['electron']}")
    @writeln @col.gray("CoffeeScript: #{require('coffee-script').VERSION}")
    @writeln @col.gray("ALASQL: #{alasql.version}")
    @writeln ""

    @writeln "Table output demo..."
    @writeln ""
    @writeln @table([
      ['0A', '0B', '0C'],
      ['1A', '1B', '1C'],
      ['2A', '2B', '2C']
    ])

    @write @col.yellow("Spinner demo ")
    spinner = @spinner()

    @writeln ""
    @writeln ""

    @async ->
      spinner.done()
      spinner = null

      @write "Success message demo " + @success 'Done!'
      @writeln ""

      @saveCursor()
      @cur.home().right(7)
      for i in [40..47]
        @attr([i])
        @write(' ')
      @resetAttr()
      @restoreCursor()

      @writeln ""
      @writeln "Icons demo..."
      @writeln ""
      @startIcons()
      @writeln(@icons.timer + @icons.heart_fill + @icons.curved_arrow + '\n' + @icons.transfer + @icons.comments + @icons.bug)
      @endIcons()
      @writeln ""
      @writeln "Not bad hein?"

    , 2500


TestTerm.register()

c = TOS.createElement('test-term')
document.body.appendChild c
