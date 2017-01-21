'use strict'
// ws模块
const ws = require('ws')
// b模块
const b = require('cjb-base')
// 工具
const util = require('util')
// domain
const domain = require('domain')
// 连接超时
var rpcTimeout = 10 * 1000
// 默认调试模块
var debug = function debug () {}
// 对外api 模块
const Api = module.exports = function Api (address, cb) {
  if (!(this instanceof Api)) {
    return new Api(address, cb)
  } else {
    this.__init(address, cb)
  }
}
// 设定调试打印方法
Api.setRpcTimeout = function setRpcTimeout (t) {
  rpcTimeout = t
}
// 设定调试打印方法
Api.setDebug = function setDebug (fn) {
  debug = fn
}
// 继承部分
const API = Api.prototype = Api.prototype || Object.create(null)
// 继承域
util.inherits(Api, domain.Domain)

// 初始化
API.__init = function (address, getApiCallback) {
  if (b.type(address, 'function')) {
    getApiCallback = address
    address = undefined
  }
  if (!address) {
    try {
      // 配置参数
      let config = require('../config')
      // 配置参数
      let log = require('../log')
      // 是否开启调试模式
      log.DEBUG = config.DEBUG || false
      // 设置语言
      log.LOCALE = config.locale
      // 设置语言文件
      log.langsFile = 'daemon.ddv.js'
      // 设置调试模块
      Api.setDebug(function (s) {
        log.debug(s)
      })
      // 默认地址
      address = address || 'ws+unix://' + config.DDV_DAEMON_RPC_PORT
      // 超时
      Api.setRpcTimeout(config.DAEMON_PRC_TIMEOUT)
    } catch (err) {
      if (getApiCallback && b.type(getApiCallback, 'function')) {
        getApiCallback(new Error('address error!'))
      }
    }
  }
  if (!b.type(address, 'string')) {
    getApiCallback(new Error('address error!'))
    return
  }
  try {
    // 建立客户端
    this.ws = new ws(address)
    // rpc-api-ws 连接成功事件
    this.ws.on('open', () => {
      debug('ws-api-open:' + address)
      this.emit('wsopen')
      this.connected = true
      this.ping((err, pid) => {
        // 防止定时器占用事件循环队列
        clearTimeout(this.__openSetTimeout)
        delete this.__openSetTimeout
        this.state = true
        this.emit('open')
        if (getApiCallback && b.type(getApiCallback, 'function')) {
          getApiCallback.call(this, err, pid)
          getApiCallback = void 0
        }
      })
    })
    // rpc-api-ws 关闭事件
    this.ws.on('close', () => {
      // 防止定时器占用事件循环队列
      clearTimeout(this.__openSetTimeout)
      delete this.__openSetTimeout
      // 调试
      debug('ws-api-close:' + address)
      if (this && this.state !== undefined) {
        this.state = false
        this.connected = false
      }
      this.emit('close')
    })
    // rpc-api-ws 出错事件
    this.ws.on('error', (err) => {
      // 防止定时器占用事件循环队列
      clearTimeout(this.__openSetTimeout)
      delete this.__openSetTimeout
      // 调试
      debug('ws-api-error:' + address)
      if (this && this.state !== undefined) {
        this.state = false
        this.connected = false
      }
      if (getApiCallback && b.type(getApiCallback, 'function')) {
        getApiCallback(err)
        getApiCallback = void 0
      }
      this.emit('close')
    })
    // rpc-api-ws 消息事件
    this.ws.on('message', (body) => {
      var res
      try {
        res = b.rowraw.parse(body)
      } catch (e) {
        res = null
      }
      if (res) {
        if (res.type === 'request') {
          if (res.protocol) {
            if (!(res.protocol && this.emit(('protocol::' + res.protocol.toLowerCase()), res))) {
              debug(res)
            }
          } else {
            debug(res)
          }
        } else if (res.type === 'response') {
          if (!(res.protocol && this.emit('request::response', res))) {
            debug(res)
          }
        } else {
          debug(res)
        }
      }
    })

    // 设定超时
    this.__openSetTimeout = setTimeout(() => {
      if (this) {
        // 回调错误 如果还没有连接成功就超时
        if (getApiCallback && b.type(getApiCallback, 'function')) {
          getApiCallback(new Error('rpc api connect timeout'))
          getApiCallback = void 0
          return
        }
      }
    }, rpcTimeout)
  } catch (err) {
    debug('ws-api-open-error:' + address)
    // 回调错误
    if (getApiCallback && b.type(getApiCallback, 'function')) {
      getApiCallback(err)
      getApiCallback = void 0
    }
  }
  this.on('request::response', (rowraw) => {
    var requestId, o, code, e
    if (!(rowraw.headers && (requestId = rowraw.headers.request_id))) {
      return
    }
    if (this.processWs && (o = this.processWs[requestId])) {
      code = parseInt(rowraw.status || 0) || 0
      if (code >= 200 && code < 300) {
        if (b.type(o.success, 'function')) {
          o.success(rowraw.headers || b.inherit(null), rowraw.body || '', rowraw)
        }
      } else {
        if (b.type(o.error, 'function')) {
          e = new Error(rowraw.statusText || 'unknown error')
          b.extend.call(e, e, rowraw)
          o.error((e.message || 'unknown error'), e)
          e = undefined
        }
      }
      delete this.processWs[requestId]
    }
    o = requestId = code = undefined
  })
}
API.disconnect = function () {
  if (this.ws && this.ws.close) {
    try {
      this.ws.close()
    } catch (e) {}
  }
}
// 发送命令行数据
API.__cmd = function (command, argv, callback) {
  this.request({
    'start': 'COMMAND /v1_0/command/' + command + ' RPCAPI/1.0',
    'headers': {
      'command_argv': b.toJSON(argv)
    },
    'success': (headers, body) => {
      if (!(callback && b.type(callback, 'function'))) {
        return false
      }
      callback.call(this, null, body)
    },
    'error': (msg, err) => {
      if (callback && b.type(callback, 'function')) {
        callback.call(this, err)
      }
      callback = undefined
    }
  })
}
API.ping = function pingDaemon (callback) {
  this.request({
    'start': 'PING /v1_0/init RPCAPI/1.0',
    'success': (headers) => {
      if (!(callback && b.type(callback, 'function'))) {
        return false
      }
      if (headers && headers.process_id) {
        this.pid = this.processId = headers.process_id
        callback.call(this, null, this.pid)
      } else {
        callback.call(this, new Error('rpc api not return pid'))
      }
      callback = undefined
    },
    'error': (msg, err) => {
      if (callback && b.type(callback, 'function')) {
        callback.call(this, err)
      }
      callback = undefined
    }
  })
}
API.request = function requestWs (o) {
  o.headers = o.headers || b.inherit(null)
  o.request_id = o.headers.request_id || o.request_id || b.createRequestId()
  o.headers.request_id = o.request_id
  o.body = o.body || ''
  o.start = o.start || ''
  if (!b.type(o.success, 'function')) {
    o.success = function () {}
  }
  if (!b.type(o.error, 'function')) {
    o.error = function (msg, e) { throw e }
  }
  o.addtime = b.time()
  o.raw = b.rowraw.stringify(o.headers, o.body, o.start)
  delete o.headers
  delete o.body
  delete o.start
  if (this.connected !== true) {
    o.error('Unknown error', new Error('Unknown error'))
    o = void 0
    return false
  }
  this.processWs = this.processWs || b.inherit(null)
  this.processWs[o.request_id] = o
  this.ws.send(o.raw, { binary: true, mask: true }, (err) => {
    if (err && o) {
      delete this.processWs[o.request_id]
      if (b.type(o.error, 'function')) {
        o.error(err.message, err)
      }
    }
    o = void 0
  })
}
// 遍历支持一下命令行
b.each('add remove lists start restart stop kill guid'.split(' '), function (index, name) {
  API[name] = function (argv, callback) {
    this.__cmd(name, argv, (err, body) => {
      if (!callback) { return }
      if (err) {
        callback.call(this, err, body)
      } else {
        try {
          let res = b.parseJSON(body.toString())
          callback.call(this, null, res)
        } catch (err) {
          callback.call(this, err, body)
        }
      }

      callback = void 0
    })
  }
})
