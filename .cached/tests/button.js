(function() {
  var c;

  c = document.createElement('button-view', {
    icon: 'book',
    label: 'Default Button'
  });

  document.body.appendChild(c);

  c = document.createElement('button-view', {
    icon: 'layers',
    label: 'Primary Button',
    primary: true
  });

  document.body.appendChild(c);

  c = document.createElement('button-view', {
    icon: 'checkmark',
    label: 'Success Button',
    success: true
  });

  document.body.appendChild(c);

  c = document.createElement('button-view', {
    icon: 'error',
    label: 'Error Button',
    error: true
  });

  document.body.appendChild(c);

  c = document.createElement('button-view', {
    icon: 'warning',
    label: 'Warning Button',
    warning: true
  });

  document.body.appendChild(c);

  c = document.createElement('button-view', {
    icon: 'info',
    label: 'Info Button',
    info: true
  });

  document.body.appendChild(c);

}).call(this);
