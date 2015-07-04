//
// opine.js
//
var fs = require('fs')
var Ripper = require('./src/Ripper')


function rip(script, source_name) { return new Ripper(script, source_name) }

function rip_file(filename) {
  return rip(fs.readFileSync(filename, {encoding: 'utf8'}), filename)
}


module.exports = {
  rip: rip,
  rip_file: rip_file
}
