
exports.hide = hide
function hide(obj, name, value) {
  var options = {}
  
  options.value = value !== undefined ? value : obj[name]
  
  options.enumerable = false
  options.writable = true

  Object.defineProperty(obj, name, options)
}
