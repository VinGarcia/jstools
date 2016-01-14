
require('./Class.js')

var test = 4

A = {$c:[0], inc:function(){this.c[0]++}, init:function(param){ this.inc(); console.log(param || 'A'); } }
B = { init:function() { this.super('B'); } }
C = {$c:[0], inc: function() { this.c[0] *= -1; this.super(); this.c[0] *= -1; }}
D = {
  hello: function(){console.log('hello')},
  init: function(arg){
    this.world = function(){ console.log('world') }
    console.log(arg||'D')
  }
}
E = {init: function() { this.super('E') }, helloWorld: function(){this.hello(); this.world();}}

a = Class.extend(A)
b = a.extend(B)
c = b.extend(C)
d = Class.extend(D)
e = d.extend(E)

// Single inheritance
if(test == 1) {
  console.log('Lista A`s:')
  a1 = new a
  a2 = new a
  a3 = new a

  console.log('Lista B`s:')
  b1 = new b
  b2 = new b
  b3 = new b

  // console.log(b1.__init_map__ === b2.__init_map__)
  // console.log( b1.__proto__.hasOwnProperty('__init_map__') )
  // console.log( b2.__proto__.hasOwnProperty('__init_map__') )
  // console.log(b1.__proto__)

  console.log('Lista C`s:')
  c1 = new c
  c2 = new c
  c3 = new c

  console.log(b1.c[0])
  console.log(c1.c[0])
}

// Multiple inheritance
if(test == 2) {

  console.log('Lista D`s:')
  d1 = new d
  d2 = new d
  d3 = new d

  console.log('Lista E`s:')
  e1 = new e
  e2 = new e
  e3 = new e

  // d1.hello()
  // d1.world()
  // e1.helloWorld()

  e1.apply(b)
  console.log(e1)

}

// Testing $sharing variables between different multi-inherited class instances.
if(test == 3) {
  
  d1 = (new d()).apply(a)
  d2 = (new d()).apply(a)

  a1 = new a
  d1.c[0] ++
  console.log(d1.c)
  console.log(d2.c)

}

// Testing the reinit function
if(test == 4) {

  F = {
    init:function(name) { this.reinit(name); },
    reinit:function(name){ console.log(name||'F') }
  }
  G = {init:function(){ this.super('G') }}

  f = Class.extend(F)
  g = f.extend(G)

  // Executing reinit:
  g1 = (new g()).apply(f, 'F!')
}

console.log('end')

