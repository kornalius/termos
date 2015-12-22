{ PropertyAccessors, path } = TOS

loadCSS(path.join(__dirname, 'term.css'))

module.exports =
  Terminal: require('./term')
  Framer: require('./framer')
  Spinner: require('./spinner')
