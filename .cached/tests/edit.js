(function() {
  var c;

  c = document.createElement('edit-view', {
    text: 'Edit text box\nand it supports multiple lines too',
    lineNumbers: false,
    theme: 'monokai',
    mode: 'coffeescript'
  });

  document.body.appendChild(c);

}).call(this);
