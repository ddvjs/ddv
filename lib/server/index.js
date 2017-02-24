'use strict'
const debug = require('debug')('ddv/server/index')
const ddvPath = require('../ddvPath')
// 对外api
const api = module.exports = Object.create(null)
// rpc远程调用模块
const rpcApiServer = require(ddvPath('lib/server/rpcapi.js'))
// 对外接口
Object.assign(api, {
  // 开启服务
  open (callback) {
    debug('open')
    return rpcApiServer.open()
  },
  // 关闭事件
  close () {
    debug('close')
    return rpcApiServer.close()
  }
})
