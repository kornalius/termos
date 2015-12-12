{ fs, VFS } = TOS


TOS.LFS = class LFS extends VFS


  isFile: (path) -> new Promise (resolve, reject) =>
    @stats path
      .then (stats) ->
        if stats.isFile()
          resolve true
        else
          reject null
      .catch (err) -> reject err


  isFolder: (path) -> new Promise (resolve, reject) =>
    @stats path
      .then (stats) ->
        if stats.isDirectory()
          resolve true
        else
          reject null
      .catch (err) -> reject err


  read: (path) -> new Promise (resolve, reject) =>
    fs.readFile path, (err, data) ->
      if !err
        resolve data
      else
        reject err


  write: (path, data) -> new Promise (resolve, reject) =>
    fs.writeFile path, data, (err) ->
      if !err
        resolve data
      else
        reject err


  exists: (path) -> new Promise (resolve, reject) =>
    @stats path
      .then resolve(true)
      .catch err


  stats: (path) -> new Promise (resolve, reject) =>
    fs.stat path, (err, stats) ->
      if !err
        resolve stats
      else
        reject err


  size: (path, deep = false) -> new Promise (resolve, reject) =>
    that = @
    @isFile path
      .then ->
        that.stats()
          .then (stats) -> resolve stats.size
          .catch (err) -> reject err

      .catch ->
        that.files deep
          .then ->
            sz = 0
            async.eachSeries files, (f, next) ->
              f.stats()
                .then (stats) ->
                  sz += stats.size
                  next()
                .catch (err) ->
                  next(err)
            , (err) ->
              if !err
                resolve sz
              else
                reject err

          .catch (err) ->
            reject err


  files: (path, deep = false) -> new Promise (resolve, reject) =>
    that = @
    fs.readdir path, (err, files) ->
      if !err
        l = []
        async.eachSeries files, (f, next) ->
          l.push new File(f)
          next()
        , (err) ->
          if !err
            resolve l
          else
            reject err
      else
        reject err


  del: (path) -> new Promise (resolve, reject) =>
    that = @
    @isFolder path
      .then ->
        that.files path
          .then (files) ->
            async.eachSeries files, (f, next) ->
              f.del()
                .then -> next()
                .catch (err) -> next(err)
            , (err) ->
              if !err
                resolve true
              else
                reject err

          .catch (err) -> reject err

        .catch ->
          fs.unlink path, (err) ->
            if !err
              resolve true
            else
              reject err


  rename: (path, newName) -> new Promise (resolve, reject) =>
    fs.rename path, newName, (err) ->
      if !err
        resolve true
      else
        reject err



  mkdir: (path) -> new Promise (resolve, reject) =>
    fs.mkdir path, (err) ->
      if !err
        resolve stats
      else
        reject err


window.lfs = new LFS()
