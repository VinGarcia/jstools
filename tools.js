// Include the Class global object.
require('./Class.js')

// Add some functions to the Object.prototype.
Object.defineProperties(Object.prototype, {
  new : {
    value : New,
    writable : false,
    enumerable : false
  },
  copy : {
    value : copy,
    writable : false,
    enumerable : false
  },
  instanceof : {
    value : instanceOf,
    writable : false,
    enumerable : false
  },
  extend : {
    value : extend,
    writable : false,
    enumerable : false
  },
  extends : {
    value : extend,
    writable : false,
    enumerable : false
  },
  merge : {
    value : merge,
    writable : false,
    enumerable : false
  },
  sample1 : {
    value : sample1,
    writable : true,
    enumerable : false
  },
  sample2 : {
    value : sample2,
    writable : true,
    enumerable : false
  }
})

exports.startTimer = startTimer
function startTimer() {
  var start = new Date().getTime()

  return function() {
    return (new Date().getTime() - start) / 1000
  }
}

// Merge the prototype chain of this and parent.
// Also merge the own properties of both.
function merge(parent) {
  if(typeof parent !== 'object' && typeof parent !== 'function') return

  var proto = {}

  var po = typeof parent === 'object'
  var to = typeof this === 'object'

  // Copy the parent prototype:
  if(po) proto = copy(Object.getPrototypeOf(parent))
  else proto = copy(parent.prototype)

  // Copy each other prototype on the prototype chain:
  var current = proto
  while(true) {
    var aux = copy(Object.getPrototypeOf(current))
    if(aux == null) break
    Object.setPrototypeOf(current, aux)
    current = Object.getPrototypeOf(current)
  }

  var this_proto = to ? Object.getPrototypeOf(this) : this.prototype

  // Link proto tail with this_proto:
  Object.setPrototypeOf(current, this_proto)

  // Set proto as prototype of this:
  if(to)
    Object.setPrototypeOf(this, proto)
  else
    this.prototype = proto

  // Copy own properties:
  for(var i in parent)
    if(parent.hasOwnProperty(i))
      this[i] = parent[i]

  return this
}

function extend() {
  if(typeof this === 'object') {
    // Apply the inheritance by prototype
    // using this as super class:
    function F(){}
    F.prototype = this;
    return new F();
  }

  if(typeof this === 'function') {
    return Class.extend.apply(this, arguments)
  }
}

// Used to instantiate javascript functions and copy objects
// usage:
//   root_obj = {'a':0, 'b':2};
//   root_func = function(){this.a=0; this.b=2;}
//   obj1 = root_obj.new(); // this one literal properties are inherited from root_obj via obj1.prototype
//   obj2 = root_func.new();
exports.new = New
function New(obj) {
  function F() {}

  if(arguments.length===0)
    obj = this

  if(typeof obj === 'function')
    return new obj()

  // If obj is an object:
  return copy(obj)
}

exports.copy = copy
function copy(obj) {
  function F() {}
  var newObj;

  if(arguments.length===0)
    obj = this;

  if(typeof obj !== 'object' && typeof obj !== 'function' || obj == null)
    return obj;

  if(typeof obj === 'object') {
    // Copy the prototype:
    newObj = {}
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
      value : obj,
      writable : true,
      enumerable : false
    }
  })

  return newObj;
}

function instanceOf(obj) {
  if(typeof obj !== 'function') return false

  var proto;
  if(typeof this === 'object')
    proto = Object.getPrototypeOf(this)
  else if(typeof this === 'function')
    proto = this.prototype

  while(true) {
    if(proto === obj.prototype)
      return true
    if(proto.__original__ !== undefined && proto.__original__ === obj.prototype)
      return true
    proto = Object.getPrototypeOf(proto)
    if(proto == null) break
  }

  return false
}

exports.print = console.log

// Join dictionary values the same way
// Array.join() does for lists.
exports.joinDict = function(dict, join_str) {

	var keys = Object.keys(dict);

	// The first element comes with no separator:
	var str = '' + dict[keys[0]];

	// For each other element do:
	for(var i in keys) {
		str +=  join_str + line[i];
	}

	return str;
}

exports.remap = function(table, getKey, getValue) {
  var atvList = []

  // If the user passed an object as parameter:
  // ( The options structure is for backward compatibility )
  if( typeof(getKey) == 'object' ) {
    var options = getKey

    getKey = options.getKey || (function(item) { return item.id; })
    getValue = options.getValue || (function(item, oldValue) { return item; })
  }
  // If the user passed functions:
  else {
    getKey = typeof getKey == 'function' ? getKey : (function(item) { return item.id; })
    getValue = typeof getValue == 'function' ? getValue : (function(item, oldValue) { return item; })
  }

  for(var i in table) {
    var key = getKey(table[i]);
    
    atvList[key] = getValue(table[i], atvList[key]);
  }

  return atvList;
}

// Deixei de lado pq json.minify não é padrão do java.
exports.loadJSON = function(filePath) {
  var fs = fs || require('fs')
  JSON.minify = JSON.minify || require("node-json-minify");

  var file = fs.readFileSync(filePath, 'utf-8')

  file = JSON.minify(file)

  return JSON.parse(file)
}


// Deixei de lado pq json.minify não é padrão do java.
exports.loadJSON = function(filePath) {
  var fs = fs || require('fs')
  JSON.minify = JSON.minify || require("node-json-minify");

  var file = fs.readFileSync(filePath, 'utf-8')

  file = JSON.minify(file)

  return JSON.parse(file)
}

// Just a class sample to use on tests:
exports.sample1 = sample1
function sample1(){this.a=0;this.b=1;this.c=2}
exports.sample2 = sample2
function sample2(){this.d=3;this.e=4;this.f=5}



























