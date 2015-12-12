{ term } = TOS

ansi_to_key = (seq) ->
  key = ''
  mods =
    shift: false
    control: false

  switch seq
    when '\x1b[5~' then  key = 'pgup'
    when '\x1b[6~' then key = 'pgdown'
    when '\x1bOF' then key = 'end'
    when '\x1bOH' then key = 'home'
    when '\x1b[2~' then key = 'insert'
    when '\x1b[3~' then key = 'delete'

  return { mods: mods, key: key }
