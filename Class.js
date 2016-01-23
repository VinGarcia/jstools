/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * Edited by Vinícius Garcia: https://github.com/vingarcia/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\bthis\s*\.\s*super\b/ : /.*/;

  // Require deep copy method:
  var copy = require('./copy.js').copy
  var hide = require('./hide.js').hide
  var instanceOf = require('./copy.js').instanceOf
  var id_count=0
 
  // The base Class implementation (does nothing)
  this.Class = function(){
    hide(this, 'apply', apply)
    hide(this, 'instanceof', instanceOf)
  }
  this.Class.prototype.init = function(){}

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
        hide(this, 'overwrite')
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
      
      try {
        var ret = func.apply(this, arguments)
      } finally {
        this['super'] = bkp
      }
 
      return ret;
    }
  }

  function wrapInit(Class, _super, prop, id) {

    var check = checkSuper(prop.init)

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
      if(!check || !prop.init)
        Super.apply(this)

      // If the user defined no init, the job is done.
      if(!prop.init) return

      /* * * * * Prepare to run init * * * * */

      // Used to keep track of super functions
      var _superFuncs

      /* * * * * Wrap it with this.super * * * * */
      var bkp = this.super
      this.super = Super
      var bkp2 = this.overwrite
      this.overwrite = function(name, func) {
        this[name] = wrapSuper(this[name], func)
        return this[name]
      }

      try {
        prop.init.apply(this, arguments);
      } finally {
        this.super = bkp
        this.overwrite = bkp2
      }

      /* * * * * Wrap any priviledged functions with `super` * * * * */
      for(var name in _superFuncs) {
        // If the priviledged function overwritten an older function:
        if( _superFuncs[name] != this[name] && this.hasOwnProperty(name) )
          this[name] = wrapSuper( _superFuncs[name], this[name] )
      }

      /* Since _super.init can be called before or inside this.init
       * and since part of the code in this wrapper must execute
       * only after _super.init is called, but before this.init
       * is executed (so the user can have the benefits of this code),
       * the Super() function bellow is wrapped as this.super()
       * to allow that code to run at the right moment even inside this.init */
      function Super() {
        _super.init.apply(this, arguments)

        /* * * * * Memorize current functions * * * * */
        _superFuncs = {}
        for (var name in this) {
          if( typeof this[name] == 'function' )
            _superFuncs[name] = this[name]
        }

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

  // Only used inside wrapInit because it is very important
  // to detect if this.super is really being called in there
  if(this.__DEBUG__) CheckSuper = checkSuper
  function checkSuper(func) {

    var funcDec = /\bfunction(?:\s*\w*)?\s*\((?:\s*\w*\s*,?)*\)\s*{/g

    var bracket = /\{|\}/g

    var supTest = /\bthis\s*\.\s*super\b/g

    funcDec.lastIndex=1
    var fn = funcDec.exec(func)
    var sup = supTest.exec(func)

    if(!fn) return sup ? true : false

    if(!sup) return false
    
    // If there is a super call between here and the next function:
    if(sup.index < fn.index) return true

    bracket.lastIndex = funcDec.lastIndex

    var nO = 1, nC = 0
    while(true) {
      while(nO > nC) {
        var ret = bracket.exec(func)
        if(ret[0] == '}') nC++;
        if(ret[0] == '{') nO++;
      }

      supTest.lastIndex = bracket.lastIndex
      sup = supTest.exec(func)
      funcDec.lastIndex = bracket.lastIndex
      fn = funcDec.exec(func)

      if(!fn) return sup ? true : false;

      if(!sup) return false;

      if(sup.index < fn.index) return true

      nO++
      bracket.lastIndex = funcDec.lastIndex
    }
  }
})();






