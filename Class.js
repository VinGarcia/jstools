/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
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
    this.apply = apply
    hide(this, 'apply')
    this.instanceof = instanceOf
    hide(this, 'instanceof')
  }

  // Used to hide special attributes:
  function hide(obj, name, options) {
    options = options || {}
    
    options.value = options.value || obj[name]
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
          (function(name, fn){
            return function() {
              var tmp = this.super;
             
              // Add a new .super() method that is the same method
              // but on the super-class
              this.super = _super[name]
             
              // The method only need to be bound temporarily, so we
              // remove it when we're done executing
              var ret = fn.apply(this, arguments);
              this.super = tmp;
             
              return ret;
            };
          })(name, prop[name]) : prop[name]
      } else if(name[0] == '$')
        // '$' denotes $hared or $tatic variables:
        prototype[name.substr(1)] = prop[name]
    }
   
    // Add an unique id to this class constructor:
    Class.__id__ = id_count++
    hide(Class, '__id__')

    // The class constructor
    function Class() {
      // Only construct if not initializing:
      if ( initializing ) return

      // Add hidden variables to `this`:
      if(!this.__init_map__) {
        this.__init_map__ = {}
        hide(this, '__init_map__')
      }

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
        if( typeof prop[name] != 'function' && name[0] !== '$')
          // If name is not defined:
          if(!this[name])
            this[name] = copy(prop[name])
      }

      // In case of multiple inheritance,
      // copy my prototype to `this` prototype chain:
      if(!this.instanceof(arguments.callee)) {
        var proto = copy(arguments.callee.prototype)
        var this_proto = Object.getPrototypeOf(this)
        Object.setPrototypeOf(proto, this_proto)
        Object.setPrototypeOf(this, proto)
      }

      // The rest of the construction is done in the init method:
      if( prop.init )
        prop.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();


