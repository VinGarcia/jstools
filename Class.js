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
  this.Class.prototype.init = function(){}

  // Used to hide special attributes:
  function hide(obj, name, value) {
    var options = {}
    
    options.value = value !== undefined ? value : obj[name]

    options.enumerable = false
    options.writable = true

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

    /* * * * * Wrap the prop functions: * * * * */

    // Wrap the the init function:
    prototype.init = wrapInit(Class, _super, prop, id_count++)

    // Wrap and copy the functions and shared variables to the prototype:
    for (var name in prop) {
      if(name == 'init') continue;

      // Copy functions and wrap `this.super` around them:
      if( typeof prop[name] == 'function' )
        prototype[name] = wrapSuper(_super[name], prop[name])

      // Also copy shared variables
      // ('$' denotes $hared variables):
      else if(name[0] == '$')
        prototype[name] = prop[name]
    }

    // The class constructor
    function Class() {

      if(initializing) return

      // On the first run prepare the hidden
      // variables of this class instance:
      if(!this.__init_map__) {
        hide(this, '__init_map__', {})

        // Hide this super in this class instance, so the user won't see it.
        hide(this, 'super')
      }

      // The rest of the construction is done in the init method:
      if( this.init )
        prototype.init.apply(this, arguments);
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
    // If the function does not call this.super, or there is no super to call:
    if( typeof _super != 'function' || !fnTest.test(func) ) return func;

    // Else:
    return function() {

      var bkp = _super
      this['super'] = _super
      
      var ret = func.apply(this, arguments)

      this['super'] = bkp

      return ret;
    }
  }

  function wrapInit(Class, _super, prop, id) {
    return function() {

      // If already initialized:
      if( this.__init_map__[id] ) {
        // If a reinit function is available:
        if(arguments.length>0 && typeof prop.reinit == 'function')
          wrapSuper(_super.reinit, prop.reinit).apply(this, arguments)

        return
      }
      this.__init_map__[id] = true

      // Copy the non-static properties from the prototype:
      for (var name in prop) {
        // Don't add functions and $hared variables:
        if( typeof prop[name] != 'function' && name[0] != '$')
          // If name is not defined:
          if(!this[name])
            this[name] = copy(prop[name])
      }

      // Call default super if not called by the user,
      // or if the user did not define an init function.
      if(!fnTest.test(prop.init) || !prop.init)
        Super.apply(this)

      // If the user defined no init, the job is done.
      if(!prop.init) return

      /* * * * * Prepare to run init * * * * */

      /* * * * * Memorize current functions * * * * */
      var _superFuncs = {}
      for (var name in this) {
        if( typeof this[name] == 'function' )
          _superFuncs[name] = this[name]
      }

      /* * * * * Wrap it with this.super * * * * */
      var bkp = this.super
      this.super = Super

      prop.init.apply(this, arguments);

      this.super = bkp

      /* * * * * Wrap any priviledged functions with `super` * * * * */
      for(var name in _superFuncs) {
        // If the priviledged function overwritten an older function:
        if( _superFuncs[name] != this[name] && this.hasOwnProperty(name) )
          this[name] = wrapSuper( _superFuncs[name], this[name] )
      }

      function Super() {
        _super.init.apply(this, arguments)

        /* In case of multiple inheritance we need to merge,
         * the prototype chain of the two Classes.
         *
         * The merging process is put in this function to make sure
         * it is done in the right order and at the right time.
         *
         * To detect if the user is merging two different classes
         * we check if this is an instance of Class, the only reason
         * it would not be, is because `this` is another's Class instance.
         *
         * The merging is complex, consider two prototype chains:
         *  - `this` prototype chain refer to the one accessible by: this.__proto__
         *  - `the` prototype chain refer to the one accessible by: Class.prototype
         *
         * The merging is as follows:
         * 
         * 1. For each prototype on `the` prototype chain we need to
         *    add a copy of it to the end of `this` prototype chain.
         *
         * 2. The order is important. So the first one added must be
         *    be the one on the higher hierarchy, followed by the rest.
         *
         * 3. To allow it we use recursion, so everytime a super constructor
         *    finishes its execution we copy its subclass prototype
         *
         * Please NOTE: The user should not try accessing Class attributes
         * from inside init before calling Super, because there is an edge
         * situation (multiple-inheritance) where they will be accesible
         * only after the call.
         *
         * Also NOTE: instanceof won't work on multiple inherited objects.
         * instead use: `(new Class()).instanceof(Class)`
         */
        var proto = Class.prototype
        if(!this.instanceof(Class)) {
          // Shallow copy to allow the correct behavior of $shared variables.
          var proto = copy(proto, function(name, obj) { return obj })
          var this_proto = Object.getPrototypeOf(this)
          Object.setPrototypeOf(proto, this_proto)
          Object.setPrototypeOf(this, proto)
        }

        // Allow extension of priviledged functions with normal functions:
        for(var name in proto) {
          if(typeof proto[name] == 'function' &&
             this.hasOwnProperty(name) &&
             typeof this[name] == 'function')
            // Use prop[name] instead of proto[name]
            // because proto[name] is already wrapped.
            this[name] = wrapSuper(this[name], prop[name])
        }
      }
    }
  }
})();


