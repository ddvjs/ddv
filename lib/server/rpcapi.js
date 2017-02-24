'use strict'
const debug = require('debug')('ddv/server/rpcapi')
const ddvPath = require('../ddvPath')
// 工具模块
const util = require('ddv-worker/util')
// 对外api
const api = module.exports = Object.create(null)
// 文件系统模块
const fs = require('fs')
// ws模块
const ws = require('ws')
// 网络模块
const net = require('net')
// http模块
const http = require('http')
// https模块
// const https = require('https')
// domain模块
const domain = require('domain')
// 内部方法工具
const fn = domain.create()
// 配置项
const config = require(ddvPath('lib/config'))
// 命令运行模块
const commandEventBind = require('./command.js')
// rowraw
const rowraw = require('ddv-rowraw')
// 对外接口
Object.assign(api, {
  // 开启服务
  open (callback) {
    if (!(fn.server && fn.server.state)) {
      return fn.listenInit()
    } else {
      return Promise.resolve()
    }
  },
  // 关闭事件
  close () {
    Array.isArray(fn.server.listen) && fn.server.listen.forEach(server => {
      try {
        util.isFunction(server.close) && server.close()
      } catch (e) {}
    })
    return Promise.resolve()
  }
})

// 监听初始化
fn.listenInit = function listenInit (callback) {
  return config.getConfig().then(() => {
    // 服务对象
    fn.server = Object.create(null)
    // 设置状态
    fn.server.state = true
    // 监听池
    fn.server.listen = fn.server.listen || []
    // 监听http和ws
    fn.server.http = http.createServer(fn.connectionHttp)
    // 创建WebSocketServer - 也就是创建WebSocket服务 - 使用httpServer 一样的端口

    fn.server.ws = new ws.Server({server: fn.server.http})
    //
    fn.server.ws.on('connection', fn.connectionWs)
    fn.server.ws.on('clientError', function (e) {
      fn.emit('error', e)
    })
    fn.server.ws.on('error', function (e) {
      fn.emit('error', e)
    })
  }).then(() => {
    // 监听http端口
    return fn.listenHttpSock()
  }).then(() => {
    // 监听内部通讯管道
    return fn.listenNamedPipeSock()
  })
}

// 有新http请求
fn.connectionHttp = function serverConnectionHttp (request, response) {
  response.end('Temporarily does not support http-rpc-api, please be patient development\n')
}
// ws请求
fn.connectionWs = function serverConnectionWs (WebSocket) {
  WebSocket.notClosed = true
  WebSocket.on('error', function _onWsError () {
    if (this.notClosed) {
      try {
        delete this.notClosed
        this.close()
      } catch (e) {}
    }
  })
  WebSocket.on('close', function _onWsClose () {
    if (this.notClosed) {
      delete this.notClosed
    }
  })
  WebSocket.on('timeout', function _onWsTimeout () {
    if (this.notClosed) {
      try {
        delete this.notClosed
        this.close()
      } catch (e) {}
    }
  })
  WebSocket.on('message', function _onWsMessage (body) {
    debug('WebSocket - message')
    if (!this.notClosed) { return console.error(Error('socket close'))/* 防止客户断开连接后继续有程序运行 */ }
    var type, res
    try {
      res = rowraw.parse(body)
    } catch (e) {
      res = null
    }
    if (res) {
      debug('WebSocket - message - res', res)
      if (res.type === 'request') {
        if (res.protocol) {
          debug('WebSocket - message - res - protocol', res.protocol)
          if (!(res.protocol && this.emit(('protocol::' + res.protocol.toLowerCase()), res))) {
            this.send(('not find protocol:' + (res.protocol || '')), function sendCb () {})
          }
        } else {
          this.send(('The server does not support this request for the time being'), function sendCb () {})
        }
      } else if (res.type === 'response') {
        this.send(('Response is not supported at this time'), function sendCb () {})
        // _push.response.call(this, res);
      } else {
        this.send(('not find type:' + type), function sendCb () {})
      }
    }
  })
  commandEventBind(WebSocket)
}
// 监听http端口
fn.listenHttpSock = function listenHttpSock (callback) {
  return Promise.resolve()
}
// 管道监听
fn.listenNamedPipeSock = function listenNamedPipeSock (callback) {
  return config.getConfig().then(() => {
    // 创建服务
    var server = net.createServer()
    // 加入监听池
    fn.server.listen.push(server)
    fn.serverEventBind(server)
    return server
  }).then(server => {
    // 如果存在管道通讯文件则删除
    return new Promise((resolve, reject) => {
      fs.stat(config.DDV_DAEMON_RPC_PORT, (err, stats) => {
        if (err) {
          // 不存在直接跳过
          resolve(server)
        } else {
          switch (true) {
            case stats.isFile():
            case stats.isDirectory():
            case stats.isBlockDevice():
            case stats.isCharacterDevice():
            case stats.isSymbolicLink():
            case stats.isFIFO():
            case stats.isSocket():
              fs.unlink(config.DDV_DAEMON_RPC_PORT, err => {
                err ? reject(err) : resolve(server)
              })
              break
            default:
              resolve(server)
              break
          }
        }
      })
    })
  }).then((server) => {
    // 试图绑定端口
    return new Promise((resolve, reject) => {
      fn.run(() => {
        try {
          server.listen(config.DDV_DAEMON_RPC_PORT, () => {
            resolve()
          })
        } catch (err) {
          reject(err)
        }
      })
    })
  }).then(() => {
    // 修改权限
    return new Promise((resolve, reject) => {
      // 修改权限
      fs.access(config.DDV_DAEMON_RPC_PORT, fs.F_OK | fs.R_OK | fs.W_OK, function (err) {
        err ? reject(err) : resolve()
      })
    })
  }).then(() => {
    // 赋予管道权限
    return new Promise((resolve, reject) => {
      fs.chmod(config.DDV_DAEMON_RPC_PORT, 0o666, function chmodCb (err) {
        err ? reject(err) : resolve()
      })
    })
  })
}
// 绑定
fn.serverEventBind = function (server, isSsl) {
  // 监听成功
  // server.on('listening',function listenCallback(){
  //  console.log('呵呵-listening',this);
  // });
  // 监听错误
  server.on('error', function (e) {
    fn.emit('error', e)
  })
  // 监听关闭
  server.on('close', function closeCallback () {
    Array.isArray(fn.server.listen) && fn.server.listen.forEach((server, index) => {
      // 回收
      if (this && server && this === server) {
        fn.server.listen.splice(index, 1)
      }
    })
  })
  if (isSsl) {
    // 监听连接上
    server.on('secureConnection', function connectionCb (socket) {
      socket.pause()
      fn.serverSocketEmit(socket)
      socket = void 0
    })
  } else {
    // 监听连接上
    server.on('connection', function connectionCb (socket) {
      socket.pause()
      fn.serverSocketEmit(socket)
      socket = void 0
    })
  }
}
// 通过 socket 触发服务
fn.serverSocketEmit = function serverSocketEmit (socket) {
  process.nextTick(function socketEmitNextTick () {
    fn.serverSocketEmitRun(socket)
    socket = void 0
  })
}
// 运行
fn.serverSocketEmitRun = function serverSocketEmitRun (socket) {
  if (socket) {
    socket.readable = socket.writable = true
    socket.server = fn.server.http
    socket.isSocketNotEnd = true
    fn.server.http.emit('connection', socket)
    socket.setTimeout(config.DAEMON_PRC_TIMEOUT || 120000)
    socket.resume()
  }
  socket = void 0
}
