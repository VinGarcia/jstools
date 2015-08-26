exports.copy = copy
function copy(obj) {
  function F() {}
  var newObj;

  if(arguments.length===0)
    obj = this;

  if(typeof obj !== 'object' && typeof obj !== 'function' || obj == null)
    return obj;
  
  if(obj.clone != undefined)
    return obj.clone()

  if(typeof obj === 'object') {
    // Copy the prototype:
    newObj = obj instanceof Array ? [] : {}
    var proto = Object.getPrototypeOf(obj)
    Object.setPrototypeOf(newObj, proto)
  } else {
    // If the object is a function the function evaluate it:
    var aux
    newObj = eval('aux='+obj.toString())
    // And copy the prototype:
    newObj.prototype = obj.prototype
  }

  // Copy the object with a deep copy:
  for(var i in obj) {
    if(obj.hasOwnProperty(i)) {
      if(typeof obj[i] !== 'object')
        newObj[i] = obj[i]
      else
        newObj[i] = copy(obj[i])
    }
  }

  // Add a reference to the original object:
  Object.defineProperties(newObj, {
    __original__ : {
      value :
        obj.__original__ != null && typeof obj.__original__== 'object'?
        obj.__original__ : obj,
      writable : true,
      enumerable : false
    }
  })

  return newObj;
}

// Receive an constructor function as obj
// or an constructor function prototype as obj
exports.instanceOf = instanceOf
function instanceOf(obj, parent) {

  if(arguments.length===0) return false
  if(arguments.length===1) {
    parent = obj
    obj = this
  }

  if(typeof parent !== 'function' && typeof parent !== 'object')
    return false

  var this_proto;
  if(typeof obj === 'object')
    this_proto = Object.getPrototypeOf(obj)
  else if(typeof obj === 'function')
    this_proto = obj.prototype

  var proto;
  if(typeof parent === 'object') {
    if(parent.__original__ != null &&
        typeof parent.__original__ == 'object')
      proto = parent.__original__
    else
      proto = parent
  }
  else if(typeof parent === 'function')
    proto = parent.prototype

  while(true) {
    if(this_proto === proto || this_proto.__original__ === proto)
      return true
    this_proto = Object.getPrototypeOf(this_proto)
    if(this_proto == null) break
  }

  return false
}
