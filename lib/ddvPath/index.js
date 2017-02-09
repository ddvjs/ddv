'use strict'
const path = require('path')
const ddvPath = module.exports = function resolveRoot (p = '') {
  return ddvPath.resolve(ddvPath.root, p)
}
ddvPath.root = path.resolve(__dirname, '../../')
var key
for (key in path) {
  if (Object.hasOwnProperty.call(path, key)) {
    ddvPath[key] = path[key]
  }
}
key = void 0
ddvPath.toString = function resolveRoot (p) {
  return ddvPath(p) + path.sep
}
ddvPath.lib = function resolveLib (p) {
  return ddvPath(ddvPath.join('lib', p))
}
