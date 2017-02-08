'use strict'
/* eslint-disable no-template-curly-in-string */
module.exports = {
  cli: require('./cli'),
  master: require('./master'),
  daemon: require('./daemon'),
  sys: require('./sys'),
  error: {
    unknown: '未知错误',
    stack: '${green}%s${green.close}\n==============错误开始==============\n%s\n%s\n==============错误结束=============='
  }
}
