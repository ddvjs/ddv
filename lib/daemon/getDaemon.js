'use strict'
module.exports = function getDaemon () {
  return new Promise((resolve, reject) => {
    global.daemon ? resolve(global.daemon) : reject(new Error('daemon为空'))
  })
}
