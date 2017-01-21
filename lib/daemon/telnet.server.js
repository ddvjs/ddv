'use strict'
const daemon = global.daemon || null
if (!daemon) {
  throw new Error('daemon为空')
}
const api = module.exports = daemon.api = daemon.api || Object.create(null)
