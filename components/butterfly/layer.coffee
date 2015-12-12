module.exports = class Layer

  constructor: (@term, x, y, w, h) ->
    @lines = null
    @copy(x, y, w, h)


  copy: (x, y, w, h) ->
    @lines = new Array(h)

    ny = 0
    for yy in [Math.max(y + @term.shift, 0)...Math.min(@term.rows, y + @term.shift + h)]
      l = new Array(w)
      nx = 0
      for xx in [Math.max(x, 0)...Math.min(@term.cols, x + w)]
        l[nx++] = _.clone(@term.screen[yy].chars[xx])
      @lines[ny++] = l


  blit: (x, y) ->
    if @lines?

      cols = @term.cols - 1
      rows = @term.rows - 1

      y += @term.shift
      for l in @lines
        break if y > rows

        sl = @term.screen[y++]
        sl.dirty = true

        xx = Math.max(x, 0)
        for c in l
          break if xx > cols
          sl.chars[xx++] = c

        y++

      @term.refresh()

