//
// Ripper
//
var acorn = require('acorn')
var yaml = require('js-yaml')
var _ = require('lodash')

var parse_err_template = _.template("${kind} at ${source} line ${line}, col ${col}: ${reason}")
var DECLARATIONS = ['function', 'var', 'let', 'const']


//
// Comment
//
function Comment(opts) {
  this.opts = opts
  this.type = null
  this.name = null
  this.is_complete = false
  try {
    this.vars = yaml.safeLoad(this.opts.text)
  } catch (e) {
    throw new Error(parse_err_template({
      kind: "YAML Error",
      source: this.opts.source_name,
      line: e.mark.line + this.opts.loc.start.line,
      col: e.mark.column,
      reason: e.reason
    }))
  }
}


Comment.is_doc_comment = function (block, text) {
  return block && text.trim().substr(0, 3) === '---'
}

Comment.prototype = {
  next_token: function (token) {
    if (DECLARATIONS.indexOf(token.value) !== -1) {
      if (this.type) {
        throw new Error(parse_err_template({
          kind: "Type Error",
          source: this.opts.source_name,
          line: this.opts.loc.start.line,
          col: this.opts.loc.start.column,
          reason: "Adjacent keywords (function, var, etc) declarations"
        }))
      }
      // */
      // (function|var|let|const) ...
      this.type = token.value
    } else if (token.type.label === 'name') {
      // */
      // (function)? variable_name
      this.type = this.type || 'variable'
      this.name = token.value
      this.is_complete = true
    } else {
      throw new Error({
        kind: "Error",
        source: this.opts.source_name,
        line: this.opts.loc.start.line,
        col: this.opts.loc.start.column,
        reason: "Comment does not precede something documentable"
      })
    }
  },
  toJS: function () {
    return {
      type: this.type,
      name: this.name,
      source: this.opts.source_name,
      line: this.opts.loc.start.line,
      vars: this.vars
    }
  }
}


//
// Ripper
//
function Ripper(script, source_name) {
  this.subjects = new Set()
  this.processing = null
  this.source_name = source_name
  acorn.parse(script, {
    onComment: this.onComment.bind(this),
    onToken: this.onToken.bind(this),
    locations: true
  })
}

Ripper.prototype = {
  onComment: function (block, text, soffset, eoffset, line_start, line_end) {
    if (!Comment.is_doc_comment(block, text)) {
      return
    }
    this.processing = new Comment({
      block: block,
      text: text,
      loc: {
        start: line_start,
        end: line_end
      },
      char_offsets: [soffset, eoffset],
      source_name: this.source_name
    })
    this.subjects.add(this.processing)
  },
  onToken: function (token) {
    if (!this.processing) { return }
    this.processing.next_token(token)
    if (this.processing.is_complete) {
      this.processing = null
    }
  },
  toJS: function () {
    var arr = []
    this.subjects.forEach(function (sj) { arr.push(sj.toJS()) })
    return arr
  }
}


module.exports = Ripper
