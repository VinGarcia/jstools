var hide = require('./hide.js').hide

exports.Except = Except
function Except(name) {
  if(!name) throw "Except expect a name!"
  var except = new Error(name)

  hide(except, 'msg', function(msg) {
    this.message = msg
    return this
  });
  
  return except
}

