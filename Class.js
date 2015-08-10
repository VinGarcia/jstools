/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bsuper\b/ : /.*/;

  // Require deep copy method:
  require('./copy.js')
 
  // The base Class implementation (does nothing)
  this.Class = function(){ this.apply = apply };

  function apply(func, args) {
    func.apply(this, [].splice.call(arguments, 1));
    return this;
  }

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
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
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing ) {
        // Call the parent constructors:
        constructor.apply(this)

        // Copy the properties over onto the new prototype:
        for (var name in prop) {
          // Don't add functions and $hared variables:
          if( typeof prop[name] != 'function' && name[0] !== '$')
            // If name is not defined:
            if(!this[name])
              this[name] = typeof prop[name] == 'object' ?
                prop[name].copy() : prop[name]
        }

        // Try to insert the prototype into this object
        // if its being called with apply()
        if(!this.instanceof(arguments.callee)) {
          var proto = arguments.callee.prototype.copy()
          var this_proto = Object.getPrototypeOf(this)
          Object.setPrototypeOf(proto, this_proto)
          Object.setPrototypeOf(this, proto)
        }

        if( prop.init )
          prop.init.apply(this, arguments);

        // Add the apply utility to this:
        Object.defineProperties(this, {
          apply : {
            value : apply,
            writable: false,
            enumerable : false
          }
        })
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
})();


