'use strict'
module.exports = function buildParams (data, prefix) {
  var r = []
  var i, key, keyt, value
  if (typeof data === 'object') {
    // 数组
    if (Array.isArray(data)) {
      for (i = 0; i < data.length; i++) {
        // 值
        value = data[i]
        // 键
        keyt = buildParamsAddPrefix(i, prefix, (typeof value === 'object'))
        // 递归处理对象和数组
        if (typeof value === 'object') {
          // 插入数组
          r.push.apply(r, buildParams(value, keyt))
        } else {
          // 插入数组
          r.push(keyt + '=' + value)
        }
      }
    } else {
      for (key in data) {
        if (!Object.hasOwnProperty.call(data, key)) {
          continue
        }
        // 值
        value = data[key]
        // 键
        keyt = buildParamsAddPrefix(key, prefix)
        if (typeof value === 'object') {
          // 插入数组
          r.push.apply(r, buildParams(value, keyt))
        } else {
          // 插入数组
          r.push(keyt + '=' + value)
        }
      }
    }
  }
  return r
}
function buildParamsAddPrefix (key, prefix, isNotArray) {
  if (prefix) {
    return prefix + '[' + (isNotArray !== false ? key : '') + ']'
  } else {
    return key
  }
}
