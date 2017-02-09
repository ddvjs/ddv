'use strict'
const debug = require('debug')('ddv/api/index')
// ws模块
const Ws = require('ws')
// 工具模块
const util = require('ddv-worker/util')
// rowraw
const rowraw = require('ddv-rowraw')
// domain
const domain = require('domain')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 对外api 模块
const Api = module.exports = class DdvApi extends domain.Domain {
  // 构造函数
  constructor (o) {
    debug('new')
    // 调用父类构造函数
    super()
    // 时间
    this.startTimeStamp = util.now() / 1000
    // 基本数据初始化
    this._baseInit(o)
    debug('new address:', this.address)
    debug('new rpcTimeout:', this.rpcTimeout)
    // 初始化响应事件
    this._requestResponseEvnetInit()
    // 返回实例化对象或者开始连接
    return o.isAutoConnect ? this : this.connect()
  }
  // 判断是否为DdvApi实例化的
  isDdvApi (o) {
    return o && (o instanceof DdvApi)
  }
  _baseInit (o) {
    // 默认地址
    this.setAddress(o.address)
    // 设置超时时间
    this.setRpcTimeout(o.rpcTimeout)
  }
  // 切换地址
  setAddress (address) {
    this.address = address || this.address || ('ws+unix://' + config.DDV_DAEMON_RPC_PORT)
  }
  // 设置超时时间
  setRpcTimeout (rpcTimeout) {
    // 设置超时时间
    this.rpcTimeout = rpcTimeout || this.rpcTimeout || API.rpcTimeout
  }
  // 连接
  connect () {
    // 调试
    debug('connect address:', this.address)
    // 调试
    debug('connect rpcTimeout:', this.rpcTimeout)
    // 返回一个Promise
    return new Promise((resolve, reject) => {
      // 建立客户端
      this.ws = new Ws(this.address)
      // rpc-api-ws 连接成功事件
      this.ws.on('open', this._eventOpen.bind(this))
      // rpc-api-ws 连接关闭事件
      this.ws.on('close', this._eventClose.bind(this))
      // rpc-api-ws 错误事件
      this.ws.on('error', this._eventError.bind(this))
      // rpc-api-ws 消息事件
      this.ws.on('message', this._eventMessage.bind(this))
      // 返回成功状态
      this._resolve = resolve
      // 返回失败状态
      this._reject = reject
      // 设定超时
      this.openWsSetTimeout = setTimeout(() => {
        debug('rpc api connect timeout:', this.address)
        // 回调错误 如果还没有连接成功就超时
        this._reject && this._reject(new Error('rpc api connect timeout'))
      }, this.rpcTimeout)
      if (this._reject) {
        this.on('error', e => {
          util.isFunction(this._reject) && this._reject(e)
        })
      }
    })
  }
  // 断开连接
  disconnect () {
    if (this.ws && this.ws.close) {
      try {
        this.ws.close()
        this.ws = void 0
      } catch (e) {}
      this._emitEventClose()
    }
  }
  // rpc-api-ws 连接成功事件
  _eventOpen () {
    // 调试
    debug('ws evnet open address:' + this.address)
    // 触发wsopen
    this.emit('wsopen')
    // ws连接成功
    this.connected = true
    this.ping().then(pid => {
      // 防止定时器占用事件循环队列
      clearTimeout(this.openWsSetTimeout)
      delete this.openWsSetTimeout
      this.state = true
      this.pid = pid
      this._resolve && this._resolve(this)
      debug('rpcapi evnet open address:' + this.address)
      this.emit('open')
    }).catch(e => {
      // 防止定时器占用事件循环队列
      clearTimeout(this.openWsSetTimeout)
      delete this.openWsSetTimeout
      this._reject && this._reject(e)
      this.disconnect()
    })
  }
  _eventClose () {
    // 调试
    debug('ws event close address:' + this.address)
    // 重置状态
    this._resetWsState()
    // 触发关闭事件
    this.emit('close')
  }
    // rpc-api-ws 出错事件
  _eventError (e) {
    // 调试
    debug('ws event error address:' + this.address)
    // 重置状态
    this._resetWsState()
    // 触发关闭事件
    this.emit('error', e)
    // 触发关闭
    this._emitEventClose()
  }
    // rpc-api-ws 消息事件
  _eventMessage (body) {
    debug('ws event _eventMessage', body)
    var res
    try {
      res = rowraw.parse(body)
    } catch (e) {
      res = null
    }
    if (res) {
      if (res.type === 'request') {
        if (res.protocol) {
          if (!(res.protocol && this.emit(('protocol::' + res.protocol.toLowerCase()), res))) {
            debug('protocol::notfind', res)
          }
        } else {
          debug('protocol::other', res)
        }
      } else if (res.type === 'response') {
        if (!(res.protocol && this.emit('request::response', res))) {
          debug('response::notfind', res)
        }
      } else {
        debug('response::other', res)
      }
    }
  }
  _emitEventClose () {
    // 下一进程
    process.nextTick(() => {
      // 如果还没有关闭就关闭
      this.connected && this._eventClose()
    })
  }
  // 重置状态
  _resetWsState () {
    // 防止定时器占用事件循环队列
    clearTimeout(this.openWsSetTimeout)
    // 删除定时器
    delete this.openWsSetTimeout
    // 删除已经连接的状态
    delete this.connected
    // 删除连接成功的状态
    delete this.state
  }
  _requestResponseEvnetInit (o) {
    this.on('request::response', this._requestResponse.bind(this))
  }
  _requestResponse (rowraw) {
    debug('request::response-_requestResponse', rowraw)
    var requestId, o, code, e
    if (!(rowraw.headers && (requestId = rowraw.headers.request_id))) {
      return
    }
    if (this.processWs && (o = this.processWs[requestId])) {
      debug('request::response-_requestResponse-processWs', requestId, o)
      code = parseInt(rowraw.status || 0) || 0
      if (code >= 200 && code < 300) {
        if (util.isFunction(o.resolve)) {
          o.resolve(rowraw)
        }
      } else {
        if (util.isFunction(o.reject)) {
          e = new Error(rowraw.statusText || 'unknown error')
          e.stack = (rowraw.headers.error_stack || '') + (rowraw.headers.error_stack ? '\n' : '') + e.stack
          Object.assign(e, rowraw)
          o.reject(e)
          e = undefined
        }
      }
      delete this.processWs[requestId]
    }
    o = requestId = code = undefined
  }
  request (o) {
    return new Promise((resolve, reject) => {
      o.headers = o.headers || Object.create(null)
      o.headers.request_id = o.requestId = o.requestId || o.headers.request_id || util.createRequestId()
      o.body = o.body || ''
      o.start = o.start || ''
      o.resolve = resolve
      o.reject = reject
      o.addtime = util.time()
      o.raw = rowraw.stringify(o.headers, o.body, o.start)
      delete o.headers
      delete o.body
      delete o.start
      if (this.connected !== true) {
        let e = new Error('no connected yet')
        o.reject(e)
        o = void 0
        return false
      }
      this.processWs = this.processWs || Object.create(null)
      this.processWs[o.requestId] = o
      this.ws.send(o.raw, { binary: true, mask: true }, (err) => {
        if (err && o && o.requestId && this.processWs && this.processWs[o.requestId]) {
          delete this.processWs[o.requestId]
          o.reject(err)
        }
        o = void 0
      })
    })
  }
  // 发送命令行数据
  cmd (command, argv) {
    debug('cmd', command, argv)
    return this.request({
      'start': 'COMMAND /v1_0/command/' + command + ' RPCAPI/1.0',
      'headers': {
        'command_argv': JSON.stringify(argv)
      }
    })
  }
  ping () {
    debug('ws ping address:' + this.address)
    return this.request({
      'start': 'PING /v1_0/init RPCAPI/1.0'
    }).then(({headers}) => {
      if (headers && headers.process_id) {
        return headers.process_id
      } else {
        throw new Error('rpc api not return pid')
      }
    })
  }
}
// 继承部分
const API = Api.prototype
// 连接超时
API.rpcTimeout = config.DAEMON_PRC_TIMEOUT || (10 * 1000)
// 对外暴露接口
Object.assign(Api, {
  // 设定连接超时
  setRpcTimeout (t) {
    API.rpcTimeout = t
  }
}, require('./local.js'))

// 遍历支持一下命令行
'add remove lists start restart stop kill guid'.split(' ').forEach(name => {
  API[name] = function (argv, callback) {
    return this.cmd(name, argv).then(({body}) => {
      return JSON.parse(body.toString())
    })
  }
})
