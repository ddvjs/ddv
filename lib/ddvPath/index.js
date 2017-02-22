'use strict'
const path = require('path')
const ddvPath = module.exports = function resolveRoot (p = '') {
  return ddvPath.resolve(ddvPath.root, p)
}
ddvPath.root = path.resolve(__dirname, '../../')

Object.keys(path || {}).forEach(key => {
  ddvPath[key] = path[key]
})

ddvPath.toString = function resolveRoot (p) {
  return ddvPath(p) + path.sep
}
ddvPath.lib = function resolveLib (p) {
  return ddvPath(ddvPath.join('lib', p))
}
