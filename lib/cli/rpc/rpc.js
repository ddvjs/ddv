'use strict'
const debug = require('debug')('ddv/cli/rpc/rpc')
// 工具
const util = require('ddv-worker/util')
// ddv 地址模块
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// api接口
const Api = require(ddvPath('lib/api'))
// rpc模块
const rpc = module.exports = function (isAutoDisconnect, cmdName, args) {
  // 如果第一个参数是 布尔值不是布尔值就自动操作
  if (!util.type(isAutoDisconnect, 'boolean')) {
    args = cmdName
    cmdName = isAutoDisconnect
    isAutoDisconnect = false
  }
  var checkAutoDisconnect = function () {
    debug('checkAutoDisconnect')
    if (isAutoDisconnect === true) {
      try {
        rpc.api.disconnect()
      } catch (e) {}
    }
    args = cmdName = isAutoDisconnect = void 0
  }
  return Promise.resolve().then(() => {
    // 如果没有连接就连接
    if (!(rpc.api && rpc.api.state === true)) {
      return rpc.connect()
    }
  })
  .then(() => {
    debug('check rpc api')
    if (!(rpc.api[cmdName] && util.isFunction(rpc.api[cmdName]))) {
      let err = new Error('find not cmd ' + cmdName + '!')
      err.error_id = 'CMD_NOT_FIND'
      throw err
    }
    // 运行这个命令
    return rpc.api[cmdName](args || {})
  }).catch((e) => {
    debug('rpc error', e)
    if (checkAutoDisconnect) {
      checkAutoDisconnect()
    }
    checkAutoDisconnect = void 0
    throw e
  }).then((res) => {
    debug('checkAutoDisconnect')
    if (checkAutoDisconnect) {
      checkAutoDisconnect()
    }
    checkAutoDisconnect = void 0
    return res
  })
}
Object.assign(rpc, {
  api: null,
  // 连接上
  connect () {
    debug('connect')
    return new Promise(function (resolve, reject) {
      // 检测是否有存在的api
      if (rpc.api && rpc.api.state === true) {
        process.nextTick(function () {
          resolve(rpc.api)
        })
      } else {
        reject(new Error('api not find'))
      }
    }).catch(() => {
      debug('Try new api connect')
      // 试图建立连接
      return new Api({
        address: config.address,
        rpcTimeout: config.rpcTimeout
      })
    }).catch((e) => {
      debug('Attempted to start a background process')
      // 因为连接失败，试图启动后台进程
      return rpc.isAutoStartDaemon !== false && util.isFunction(Api.startDaemon) ? Api.startDaemon().then(() => {
        debug('Try again to establish a connection')
        // 再次试图建立连接
        return new Api({
          address: config.address,
          rpcTimeout: config.rpcTimeout
        })
      }) : Promise.reject(e)
    }).then((api) => {
      debug('new api connect success')
      rpc.api = api
      return rpc.api
    })
  },
  // 断开连接
  disconnect () {
    if (rpc.api && util.isFunction(rpc.api.disconnect)) {
      debug('Try api disconnect')
      rpc.api.disconnect()
    }
    rpc.api = null
  }
})
