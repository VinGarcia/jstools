Object.defineProperties(Object.prototype, {
  copy : {
    value : copy,
    writable : false,
    enumerable : false
  },
  instanceof : {
    value : instanceOf,
    writable : false,
    enumerable : false
  }
})

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
function instanceOf(obj) {
  if(typeof obj !== 'function' && typeof obj !== 'object') return false

  var this_proto;
  if(typeof this === 'object')
    this_proto = Object.getPrototypeOf(this)
  else if(typeof this === 'function')
    this_proto = this.prototype

  var proto;
  if(typeof obj === 'object') {
    if(obj.__original__ != null && typeof obj.__original__ == 'object')
      proto = obj.__original__
    else
      proto = obj
  }
  else if(typeof obj === 'function')
    proto = obj.prototype

  while(true) {
    if(this_proto === proto || this_proto.__original__ === proto)
      return true
    this_proto = Object.getPrototypeOf(this_proto)
    if(this_proto == null) break
  }

  return false
}
