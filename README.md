# opine.js

This converts Javascript inline comments by way of YAML into regularized data
that can be used to generate automatic documentation.

Any block comment that starts with `---` will be parsed as [YAML](https://en.wikipedia.org/wiki/YAML), with
the result added as `vars` to a result.

For example, given

**spec/fixtures/sample-1.js**

```javascript

/*---
  comment: 123
 */
function fn_name() { }


/*---
  trying: something
 */
var x
```

then running

```javascript
var opine = require('opine')
opine.rip_file('./spec/fixtures/sample-1.js')
```

returns something like this:

```javascript
[ { type: 'function',
    name: 'fn_name',
    source: "./spec/fixtures/sample-1.js",
    line: 2,
    vars: { comment: 123 } },
  { type: 'var',
    name: 'x',
    source: "./spec/fixtures/sample-1.js"
    line: 8,
    vars: { trying: 'something' } }
]
```
