Framer = require('./framer')

module.exports = class Spinner extends Framer

  constructor: (@term, type = 0) ->

    switch type

      when 1
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▁']

      when 2
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['▖', '▘', '▝', '▗']

      when 3
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['◢', '◣', '◤', '◥']

      when 4
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['◐', '◓', '◑', '◒']

      when 5
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['⠁', '⠂', '⠄', '⡀', '⢀', '⠠', '⠐', '⠈']

      when 6
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['▉','▊','▋','▌','▍','▎','▏','▎','▍','▌','▋','▊','▉']

      when 7
        a = ['[   ]', '[>  ]', '[>> ]', '[>>>]', '[ >>]', '[  >]', '[   ]', '[  <]', '[ <<]', '[<<<]', '[<< ]', '[<  ]']

      else
        a = if process.platform == 'win32' then ['-', '\\', '|', '/'] else ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

    super(@term, @term.x, @term.y, 100, a)
