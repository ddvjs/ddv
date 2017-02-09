'use strict'
// ddv路径模块
const ddvPath = require('../ddvPath')
const Api = module.exports = Object.create(null)
Api.startDaemon = require(ddvPath('lib/daemon/satan.js'))
Object.assign(Api, require(ddvPath('lib/daemon/startup.js')))
