'use strict'
/* eslint-disable no-template-curly-in-string */
module.exports = {
  cli: require('./cli'),
  sys: require('./sys'),
  error: {
    unknown: 'Unknown Error',
    stack: '${green}%s${green.close}\n==============Error start==============\n%s\n%s\n==============Error end=============='
  }
}
