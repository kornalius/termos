{ app, path, VFS, Promise } = TOS
mime = require('mime')


_id = (path) -> _.trimRight path.toLowerCase(), '/'


TOS.DBFS = class DBFS extends VFS


  clear: -> new Promise (resolve, reject) =>
    alasql """DROP INDEXEDDB DATABASE IF EXISTS termos;
            CREATE INDEXEDDB DATABASE IF NOT EXISTS termos;
            ATTACH INDEXEDDB DATABASE termos;
            USE termos;
            CREATE TABLE IF NOT EXISTS fs (path_name STRING PRIMARY KEY, data STRING, size NUMBER, ctime NUMBER, mtime NUMBER)""", [], (res, err) ->
      if !err
        resolve true
      else
        reject err


  use: -> new Promise (resolve, reject) =>
    that = @
    @ready()
      .then -> resolve true
      .catch ->
        that.clear()
          .then -> resolve true
          .catch (err) -> reject err


  ready: -> new Promise (resolve, reject) =>
    alasql "ATTACH INDEXEDDB DATABASE termos", [], (res, err) ->
      if !err
        resolve true
      else
        reject err


  exists: (path) -> new Promise (resolve, reject) =>
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT path_name FROM fs WHERE path_name == '#{_id(path)}'", [], (res, err) ->
      if !err
        resolve res?.length > 0
      else
        reject err


  read: (path) -> new Promise (resolve, reject) =>
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT data FROM fs WHERE path_name == '#{_id(path)}'", [], (res, err) ->
      if !err
        resolve if res.length >= 3 then res[2][0].data else null
      else
        reject err


  write: (path, data) -> new Promise (resolve, reject) =>
    p = _id(path)
    t = Date.now()
    l = data.length
    alasql """
            ATTACH INDEXEDDB DATABASE termos; USE termos;
            IF (SELECT path_name FROM fs WHERE path_name == '#{p}')
              UPDATE fs SET data = '#{data}', size = #{l}, mtime = #{t} WHERE path_name == '#{p}'
            ELSE
              INSERT INTO fs VALUES { path_name: '#{p}', data: '#{data}', size: #{l}, ctime: #{t}, mtime: #{t} }
           """, [], (res, err) ->
      if !err
        resolve true
      else
        reject err


  stats: (path) -> new Promise (resolve, reject) =>
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT size, ctime, mtime FROM fs WHERE path_name == '#{_id(path)}'", [], (res, err) ->
      if !err
        resolve if res.length >= 3 then res[2][0] else null
      else
        reject err


  del: (path) -> new Promise (resolve, reject) =>
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; DELETE FROM fs WHERE path_name == '#{_id(path)}'", [], (res, err) ->
      if !err
        resolve true
      else
        reject err


  rename: (path, new_path) -> new Promise (resolve, reject) =>
    p = _id(path)
    t = Date.now()
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; UPDATE fs path_name = '#{_id(new_path)}', mtime = #{t} WHERE path_name == '#{p}'", [], (res, err) ->
      if !err
        resolve true
      else
        reject err


  files: (path, deep = false) -> new Promise (resolve, reject) =>
    p = _id(path)
    alasql "ATTACH INDEXEDDB DATABASE termos; USE termos; SELECT path_name FROM fs WHERE path_name LIKE '#{p}%'", [], (res, err) ->
      if !err
        resolve if res.length >= 3 then _.map(res[2], (v) -> v.path_name) else null
      else
        reject err


window.dbfs = new DBFS()
