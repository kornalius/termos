{ PropertyAccessors, path } = TOS

loadCSS(path.join(__dirname, 'term.css'))

module.exports =
  Terminal: require('./term.coffee')
  Framer: require('./framer.coffee')
  Spinner: require('./spinner.coffee')
