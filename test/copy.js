
require('should')

copy = require('../copy.js').copy

var assert = require('assert');
describe('#copy', function() {
  describe('#literal', function() {
    it('should return the exact same object', function () {
      copy(0).should.be.exactly(0)
      copy(1).should.be.exactly(1)
      copy(2).should.be.exactly(2)
      copy("").should.be.exactly("")
      copy("123").should.be.exactly("123")
    });
  });

  describe('#lists', function() {
    it('should not be undefined', function () {
      a = {}
      var should = require('should').noConflict()
      should(a.copy).not.be.ok()
    });
  });
});
