/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * Edited by Vinícius Garcia: https://github.com/vingarcia/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bsuper\b/ : /.*/;

  // Require deep copy method:
  var copy = require('./copy.js').copy
  var instanceOf = require('./copy.js').instanceOf
  var id_count=0
 
  // The base Class implementation (does nothing)
  this.Class = function(){
    hide(this, 'apply', apply)
    hide(this, 'instanceof', instanceOf)
  }

  // Used to hide special attributes:
  function hide(obj, name, value) {
    var options = {}
    
    options.value = value || obj[name]
    options.enumerable = false

    Object.defineProperty(obj, name, options)
  }

  function apply(func, args) {
    func.apply(this, [].splice.call(arguments, 1));
    return this;
  }

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {

    if(!prop || typeof prop !== 'object') prop = {}

    var _super = this.prototype;
    var constructor = this
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the functions to the prototype:
    for (var name in prop) {
      if( typeof prop[name] == 'function' ) {
        // Check if we're overwriting an existing function
        prototype[name] = typeof _super[name] == "function" &&
          fnTest.test(prop[name]) ?

          // Wrap this.super around the function call
          wrapSuper(_super[name], prop[name]) :

          // If not a function, or if it does not call super:
          prop[name]

      } else if(name[0] == '$')
        // '$' denotes $hared or $tatic variables:
        prototype[name.substr(1)] = prop[name]
    }
   
    // Add an unique id to this class constructor:
    hide(Class, '__id__', id_count++)

    // The class constructor
    function Class() {
      // Only construct if not initializing:
      if ( initializing ) return

      // Add the init_map to keep record
      // of already initialized constructors:
      if(!this.__init_map__)
        hide(this, '__init_map__', {})

      // * * * * * Start parents construction: * * * * *

      // Call the parent constructors:
      constructor.apply(this)

      var id = arguments.callee.__id__

      // If this constructor is already initialized
      if( this.__init_map__[id] ) return

      // else add it to the initialization map:
      else this.__init_map__[id] = true

      // * * * * * Start construction: * * * * *

      // Copy the non-static properties from the prototype:
      for (var name in prop) {
        // Don't add functions and $hared variables:
        if( typeof prop[name] != 'function' && name[0] != '$')
          // If name is not defined:
          if(!this[name])
            this[name] = copy(prop[name])
      }

      // In case of multiple inheritance,
      // copy this function's prototype
      // to `this` prototype chain:
      if(!this.instanceof(arguments.callee)) {
        var proto = copy(arguments.callee.prototype)
        var this_proto = Object.getPrototypeOf(this)
        Object.setPrototypeOf(proto, this_proto)
        Object.setPrototypeOf(this, proto)
      }

      // * * * * * Memorize current functions * * * * *//

      var _super = {}
      for (var name in this) {
        if( typeof this[name] == 'function' )
          _super[name] = this[name]
        }

      // Call init:
      if( prop.init )
        prop.init.apply(this, arguments);

      // * * * * * Wrap priviledged functions with `super` * * * * *

      // For each of the saved functions:
      for(var name in _super) {
        // If a priviledged function overwritten the old function:
        if( _super[name] != this[name] && fnTest.test(this[name]) )
          this[name] = wrapSuper( _super[name], this[name] )
      }
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };

  function wrapSuper(_super, func) {
    return function() {

      var bkp = _super
      this.super = _super
      
      var ret = func.apply(this, arguments)

      this.super = bkp

      return ret;
    }
  }
})();


