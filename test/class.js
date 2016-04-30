
__DEBUG__ = true
require('../Class.js')
should = require('should/as-function')
require('should')

var test = 1
var output;

A = {$c:[0], inc:function(){this.$c[0]++}, init:function(param){ this.inc(); output=(param || 'A'); } }
B = { init:function() { this.super('B'); } }
C = {$c:[0], inc: function() { this.$c[0] *= -1; this.super(); this.$c[0] *= -1; }}
D = {
  hello: function(){output=('hello')},
  init: function(arg){
    this.world = function(){ output+=(' world') }
    output=(arg||'D')
  }
}
E = {init: function() { this.super('E') }, helloWorld: function(){this.hello(); this.world();}}

a = Class.extend(A)
b = a.extend(B)
c = b.extend(C)
d = Class.extend(D)
e = d.extend(E)
var a1,a2,a3
var b1,b2,b3
var c1,c2,c3

describe('#Class', function() {
  describe('Single inheritance', function() {
    it('should build ok', function() {
      //console.log('Lista A`s:')
      a1 = new a
      a2 = new a
      a3 = new a
      var outA = output
  
      //console.log('Lista B`s:')
      b1 = new b
      b2 = new b
      b3 = new b
      var outB = output

      //console.log('Lista C`s:')
      c1 = new c
      c2 = new c
      c3 = new c
      var outC = output

      should(a1).be.ok()
      should(a2).be.ok()
      should(a3).be.ok()
      should(outA).equal('A')

      should(b1).be.ok()
      should(b2).be.ok()
      should(b3).be.ok()
      should(outB).equal('B')

      should(c1).be.ok()
      should(c2).be.ok()
      should(c3).be.ok()
      should(outC).equal('B')
    }); 
  
    it('should share global var correctly', function() {
      should(b1.$c[0]).equal(6)
      should(c1.$c[0]).equal(-3)
    });
  });

  describe('Multiple inheritance', function() {
    it('should build ok', function() {
      //console.log('Lista D`s:')
      d1 = new d
      d2 = new d
      d3 = new d
      var outD = output

      //console.log('Lista E`s:')
      e1 = new e
      e2 = new e
      e3 = new e
      var outE = output

      should(d1).be.ok()
      should(d2).be.ok()
      should(d3).be.ok()
      should(outD).equal('D')
    
      should(e1).be.ok()
      should(e2).be.ok()
      should(e3).be.ok()
      should(outE).equal('E')
    
      d1.hello()
      should(output).equal('hello')
      d1.world()
      should(output).equal('hello world')
      e1.helloWorld('hello world')
      should(output).equal('hello world')
    });

    it('should allow apply()', function() {
    
      e1.apply(b)
      should(e1).have.property('hello').which.is.Function()
      should(e1).have.property('world').which.is.Function()
      should(e1).have.property('helloWorld').which.is.Function()
      should(e1).have.property('inc').which.is.Function()
      should(e1).have.property('$c').which.is.Array()
      //console.log(e1)
    });

    it('should share variable correctly', function() {
        
      d1 = (new d()).apply(a)
      d2 = (new d()).apply(a)

      should(a1.$c[0]).equal(9)

      d1.$c[0] ++

      should(a1.$c[0]).equal(10)

      should(a1.$c).be.eql(d1.$c)
      should(a1.$c).be.eql(d2.$c)
    });

    it('should execute reinit correctly', function() {
      F = {
        init:function(name) { this.reinit(name); },
        reinit:function(name){ output=(name||'F') }
      }
      G = {init:function(){ this.super('G') }}
    
      f = Class.extend(F)
      g = f.extend(G)
    
      // Building instance
      g1 = new g()
      var outG = output

      // Executing reinit:
      g1.apply(f, 'F!')
      var outF = output

      should(outG).be.eql('G')
      should(outF).be.eql('F!')
    });
    it('should execute overwrite correctly', function() {
      var _overwrite;
      var erased = function(){}

      function batata() {}
      function batatu() { this.super() }

      H = {
        init:function() {
          this.test = this.overwrite('batata', batata);
        }
      }
      I = {
        overwrite : erased,
        init:function() {
          _overwrite = this.overwrite;
          this.overwrite('test', batatu)
          this.overwrite('batata', batata)
        }
      }
    
      h = Class.extend(H)
      i = h.extend(I)

      // Building instances
      h1 = new h
      i1 = new i
    
      h1.should.have.propertyWithDescriptor('overwrite', { enumerable : false, writable : true, value : _overwrite })
      h1.should.have.property('test').which.is.Function()
      h1.should.have.property('batata').which.is.Function()
      should(h1.test).equal(h1.batata)
      should(h1.batata).equal(batata)

      i1.should.have.propertyWithDescriptor('overwrite', { enumerable : false, writable : true, value : erased })
      i1.should.have.property('test').which.is.Function()
      i1.should.have.property('batata').which.is.Function()
      should(i1.test).not.equal(batatu)
      should(i1.batata).equal(batata)
    });
  });
  describe('In any case', function(){
    it('should detect a super call correctly', function(){
      var check = CheckSuper

      check(function(){}).should.equal(false)
      check(function(){this.super()}).should.equal(true)
      check(function(){this.super(); function btt(){}}).should.equal(true)
      check(function(){ function btt(){this.super()} }).should.equal(false)
      check(function(){ function btt(){this.super()} this.super() }).should.equal(true)
      check(function(){ function btt(){this.super()} this.super(); function btt2(){ this.super() } }).should.equal(true)
      check(function(){ function btt(){this.super()} function btt2(){ this.super() } }).should.equal(false)
      check(function(){ function btt(){this.super()} function btt2(){ this.super() } this.super() }).should.equal(true)

      check(fun1).should.equal(true)
      check(fun2).should.equal(false)

      function fun1(arg1, arg2, arg3) {
        function btt(batata) {var batatinha = function() { console.log('loucura digital') }; return batata }
        btt()();
        function noname() {}
        this.batata = function festaDaAlegria() {console.log('Loucura!'); this.super() }
        var ret = this.super()
        function panicats() { this.super().safadeza() }
        potato = function(args) { this.super(); return 10 }
      }

      function fun2(arg1, arg2, arg3) {
        function btt(batata) {var batatinha = function() { console.log('loucura digital') }; return batata }
        btt()();
        function noname() {}
        this.batata = function festaDaAlegria() {console.log('Loucura!'); this.super() }
        function panicats() { this.super().safadeza() }
        potato = function(args) { this.super(); return 10 }
      }
    });
    it('should not depend on `this.instanceof` to be preserved', function() {
      var called = false;
      var erased = function(){ called = true }
      J = {
        instanceof : erased
      }

      j = Class.extend(J)

      // Building instances
      j1 = new j

      should(called).equal(false)
    });
  });
});
