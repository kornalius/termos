Layer = require('./layer.coffee')

module.exports = class Framer

  constructor: (@term, @x = null, @y = null, @speed = 100, @frames = ['']) ->
    if !@x? and !@y?
      @x = @term.x
      @y = @term.y

    @fi = 0

    maxLength = 0
    for f in @frames
      if f.length > maxLength
        maxLength = f.length

    @layer = new Layer(@term, @x, @y, maxLength, 1)

    @interval = setInterval(@render, @speed)

    @cursorHidden = @term.cursorHidden


  next: ->  @frames[@fi++ % @frames.length]


  render: =>
    @term.cursorHidden = true

    ox = @term.x
    oy = @term.y

    @term.x = @x
    @term.y = @y

    @layer.blit(@x, @y)
    @term.write(@next())

    @term.x = ox
    @term.y = oy

    @term.cursorHidden = @cursorHidden
    @term.showCursor()


  done: ->
    @layer.blit(@x, @y, @saved)

    clearInterval(@interval)
    @interval = null

    @layer = null

    @term.cursorState = 0
    @term.showCursor()
