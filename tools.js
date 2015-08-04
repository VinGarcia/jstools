
exports.extend = function(obj) {
  function F() {}
  F.prototype = obj;
  return new F();
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


exports.remap_old = function(table, options) {
  var atvList = [];

  if(options === undefined) options = {};
  var getKey = options.getKey || (function(item) { return item.id; });
  var getValue = options.getValue || (function(item) { return item; });
  dropDuplicates = options.dropDuplicates || false;
  // console.log(options);
  // console.log(options.dropDuplicates);
  // console.log(dropDuplicates);

  for(var i in table) {
    var key = getKey(table[i]);

    // If that is the first item with such key:
    if(atvList[key] === undefined) {
      //console.log("Normal: " + key);
      if(!dropDuplicates)
      	// Insert a list of items:
        atvList[key] = [ getValue(table[i], atvList[key]) ];
      else
      	// Insert a single item:
        atvList[key] = getValue(table[i], atvList[key]);
    }
    else if(!dropDuplicates) {
      // console.log("Duplicada: " + key);
      atvList[key].push( getValue(table[i]) );
    }
  }
  return atvList;
}




























