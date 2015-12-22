{ fs, path, dirs, cson, loadSetting } = TOS

TOS.Theme = class Theme

  @load: (name, macros) ->
    loadSetting "themes/#{name}/index.cson", (err, p, data) ->
      if !err?
        for f in data.files
          loadCSS(path.join(path.dirname(p), f), name, macros)

  @unload: (name) -> unloadCSS(name)

