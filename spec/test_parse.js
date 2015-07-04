//
// Test Parsing
//
var opine = require('../index')
var assert = require('chai').assert

describe("Opine", function () {
  it("sample-1 works", function () {
    var result = opine.rip_file("./spec/fixtures/sample-1.js").toJS()
    var expect = [{
      name: "fn_name",
      type: "function",
      source: "./spec/fixtures/sample-1.js",
      line: 2,
      vars: {
        comment: 123
      }
    }, {
      name: "x",
      type: "var",
      source: "./spec/fixtures/sample-1.js",
      line: 8,
      vars: {
        trying: "something"
      }
    }]
    assert.deepEqual(result, expect)
  })

  it("correctly identifies error offset", function () {
    try {
      opine.rip_file("./spec/fixtures/yaml-error.js").toJS()
    } catch (e) {
      assert.include(e.toString(), 'line 7, col 11')
      assert.include(e.toString(), 'yaml-error.js')
    }
  })
})
