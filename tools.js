
exports.startTimer = startTimer
function startTimer() {
  var start = new Date().getTime()

  return function() {
    return (new Date().getTime() - start) / 1000
  }
}

// This function apply three distinct behaviors:
// With one function as parameter:
// - make `this` inherit from `parent` by function call
// With one object as parameter:
// - make a deep copy of the `parent` `ownProperties` into `this`
// with no parameters:
// - make a new object that inherits from this by prototype inheritance
Object.prototype.extends = extend
Object.prototype.extend = extend
function extend(parent) {
  // Apply the inheritance by constructor call
  // using parent as super class.
  if(typeof parent === 'function') {
    parent.apply(this)
    return this
  }

  // Make a deep copy of the `parent` own properties:
  if(typeof parent === 'object') {
    for(var i in parent)
      if(parent.hasOwnProperty(i))
        this[i] = copy(parent[i])
    return this;
  }

  // Apply the inheritance by prototype
  // using this as super class:
  if(arguments.length === 0) {
    function F(){}
    F.prototype = this;
    var obj = new F();
    return obj;
  }
}

// Used to instantiate javascript functions and copy objects
// usage:
//   root_obj = {'a':0, 'b':2};
//   root_func = function(){this.a=0; this.b=2;}
//   obj1 = root_obj.new(); // this one literal properties are inherited from root_obj via obj1.prototype
//   obj2 = root_func.new();
Object.prototype.new = New
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

Object.prototype.copy = copy
exports.copy = copy
function copy(obj) {
  function F() {}
  var newObj;

  if(arguments.length===0)
    obj = this;

  if(typeof obj !== 'object' && typeof obj !== 'function')
    return obj;

  if(typeof obj === 'object') {
    // Copy the prototype with a shallow copy:
    for(var i in obj) {
      if(!obj.hasOwnProperty(i))
        F.prototype[i] = obj[i]
    }

    // Instantiate the object with the copied prototype:
    newObj = new F()
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

  return newObj;
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
exports.sample = function(){this.a=0;this.b=1;this.c=2}
exports.sample2 = function(){this.d=3;this.e=4;this.f=5}



























