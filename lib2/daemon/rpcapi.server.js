'use strict'
const daemon = global.daemon || null
if (!daemon) {
  throw new Error('daemon为空')
}
// 对外api
const api = module.exports = daemon.server.api = daemon.server.api || Object.create(null)
// 文件系统模块
const fs = require('fs')
// ws模块
const ws = require('ws')
// 网络模块
const net = require('net')
// http模块
const http = require('http')
// https模块
const https = require('https')
// domain模块
const domain = require('domain')
// 内部方法工具
const fn = domain.create()
// 配置项
const config = daemon.config
// cjb-base
const cjbbase = daemon.lib.base
// b模块
const b = cjbbase.inherit(cjbbase)
// 命令运行模块
const commandEventBind = require('./rpcapi.command.js')

// 开启服务
api.open = function open (callback) {
  if (!(fn.server && fn.server.state)) {
    fn.listenInit(callback)
  } else {
    callback(null)
  }
}
// 关闭事件
api.close = function close () {
  var i
  for (i = 0; i < fn.server.listen.length; i++) {
    try {
      if (fn.server.listen[i] && fn.server.listen[i].close) {
        fn.server.listen[i].close()
      }
    } catch (e) {}
  }
}
// 监听初始化
fn.listenInit = function listenInit (callback) {
  var q
  // 创建队列，绑定结束事件
  q = b.queue().end(function onEnd (state, res) {
    if (q && callback && b.type(callback, 'function')) {
      if (state) {
        callback(null)
      } else {
        callback(res)
      }
    }
    q = callback = void 0
  }).push(function (next) {
    // 服务对象
    fn.server = Object.create(null)
    // 设置状态
    fn.server.state = true
    // 监听池
    fn.server.listen = fn.server.listen || []
    // 监听http和ws
    fn.listenHttpAndWs()
    // 下一步
    next()
  }, true, function listenRun (next, success, fail) {
    // 监听http端口
    fn.listenHttpSock(function listenHttpSockCb (err) {
      return q && (err ? fail(err) : next())
    })
  }, true, function editAccessByChmod (next, success, fail) {
    // 监听内部通讯管道
    fn.listenNamedPipeSock(function listenNamedPipeSockCb (err) {
      return q && (err ? fail(err) : success())
    })
  }).run()
}
// 监听http和ws
fn.listenHttpAndWs = function listenHttp () {
  fn.server.http = http.createServer(fn.connectionHttp)
  // 创建WebSocketServer - 也就是创建WebSocket服务 - 使用httpServer 一样的端口
  fn.server.ws = ws.createServer({server: fn.server.http})
  //
  fn.server.ws.on('connection', fn.connectionWs)
  fn.server.ws.on('clientError', function (e) {
    fn.emit('error', e)
  })
  fn.server.ws.on('error', function (e) {
    fn.emit('error', e)
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
    if (!this.notClosed) { return console.error(Error('socket close'))/* 防止客户断开连接后继续有程序运行 */ }
    var type, res
    try {
      res = b.rowraw.parse(body)
    } catch (e) {
      res = null
    }
    if (res) {
      if (res.type == 'request') {
        if (res.protocol) {
          if (!(res.protocol && this.emit(('protocol::' + res.protocol.toLowerCase()), res))) {
            this.send(('not find protocol:' + (res.protocol || '')), function sendCb () {})
          }
        } else {
          this.send(('The server does not support this request for the time being'), function sendCb () {})
        }
      } else if (res.type == 'response') {
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
  callback(null)
}
// 管道监听
fn.listenNamedPipeSock = function listenNamedPipeSock (callback) {
  var q, server
  q = b.queue().end(function onEnd (state, res) {
    if (q && callback && b.type(callback, 'function')) {
      if (state) {
        callback(null)
      } else {
        callback(res)
      }
    }
    q = callback = void 0
  }).push(function (next) {
    // 创建服务
    server = net.createServer()
    // 加入监听池
    fn.server.listen.push(server)
    fn.serverEventBind(server)
    next()
  }, true, function listenNamedPipeSockRm (next, success, fail) {
    // 如果存在管道通讯文件则删除
    try {
      let stat = fs.statSync(config.DDV_DAEMON_RPC_PORT)
      switch (true) {
        case stat.isFile():
        case stat.isDirectory():
        case stat.isBlockDevice():
        case stat.isCharacterDevice():
        case stat.isSymbolicLink():
        case stat.isFIFO():
        case stat.isSocket():
          fs.unlink(config.DDV_DAEMON_RPC_PORT, function unlinkCb (err) {
            return q && (err ? fail(err) : next())
          })
          break
        default:
          next()
          break
      }
    } catch (e) {
      next()
    }
  }, true, function listenRun (next) {
    fn.run(function listenRunTry () {
      // 试图绑定端口
      server.listen(config.DDV_DAEMON_RPC_PORT, function () {
        next()
      })
    })
  }, true, function editAccessByChmod (next, success, fail) {
    // 修改权限
    fs.access(config.DDV_DAEMON_RPC_PORT, fs.F_OK | fs.R_OK | fs.W_OK, function (err) {
      return q && (err ? fail(err) : next())
    })
  }, true, function editAccess (next, success, fail) {
    // 赋予管道权限
    fs.chmod(config.DDV_DAEMON_RPC_PORT, 0o666, function chmodCb (err) {
      return q && (err ? fail(err) : success())
    })
  }).run()
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
    b.each(fn.server.listen, function (index, server) {
      // 回收
      if (this && server && this === server) {
        fn.server.listen.splice(index, 1)
      }
    }, true, this)
  })
  if (isSsl) {
    // 监听连接上
    server.on('secureConnection', function connectionCb (socket) {
      socket.pause()
      fn.serverSocketEmit(socket)
      socket = undefined
    })
  } else {
    // 监听连接上
    server.on('connection', function connectionCb (socket) {
      socket.pause()
      fn.serverSocketEmit(socket)
      socket = undefined
    })
  }
}
// 通过 socket 触发服务
fn.serverSocketEmit = function serverSocketEmit (socket) {
  process.nextTick(function socketEmitNextTick () {
    fn.serverSocketEmitRun(socket)
    socket = undefined
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
  socket = undefined
}
