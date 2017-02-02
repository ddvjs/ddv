'use strict'
const daemon = global.daemon || null
if (!daemon) {
  throw new Error('daemon为空')
}
// 文件系统模块
const fs = require('fs')
// 配置项
const config = daemon.config
// cjb-base
const cjbbase = daemon.lib.base
// b模块
const b = cjbbase.inherit(cjbbase)
// 通过头中提取argv
const getCommandArgvByHeaders = (headers) => {
  var argv = null
  if (headers && b.type(headers, 'object') && headers.command_argv) {
    try {
      argv = b.parseJSON(headers.command_argv)
    } catch (e) {
      argv = null
    }
  }
  headers = void 0
  return argv
}
// 通过头中提取argv
const getRowrawByErrOrBody = (headers, err, body) => {
  var stat, raw
  body = body || new Buffer(0)
  if (!Buffer.isBuffer(body)) {
    body = b.type(body, 'string') ? (new Buffer(body, 'utf-8')) : (new Buffer(0))
  }
  if (!b.type(headers, 'object')) {
    let headers_temp = Object.create(null)
    headers_temp.request_id = b.type(headers, 'string') ? headers : ''
    headers = headers_temp
    headers_temp = void 0
  }
  if (err) {
    stat = 'RPCAPI/1.0 400 ' + (err.error_id || err.message || 'Unknow Error')
    headers.error_stack = err.stack
    headers.error_message = err.message
  } else {
    stat = 'RPCAPI/1.0 200 OK'
  }
  raw = b.rowraw.stringify(headers, body, stat)
  headers = body = stat = void 0
  return raw
}
// 通过头中提取argv
const checkHeadersRequestId = (headers) => {
  if (headers && b.type(headers, 'object') && headers.request_id) {
    headers = void 0
    return true
  }
  headers = void 0
  return false
}
// 绑定事件
const commandEventBind = function commandEventBind (WebSocket) {
  // rpcapi事件转发
  WebSocket.on('protocol::rpcapi', (rowraw) => {
    if (!(rowraw.method && rowraw.path && this.emit(['rpcapi', rowraw.method.toLowerCase(), rowraw.path], rowraw.headers, rowraw.body, rowraw))) {
      let stat = 'RPCAPI/1.0 404 Not Found'
      let raw = b.rowraw.stringify({
        'request_id': rowraw.headers.request_id
      }, new Buffer(0), stat)
      this.send(raw, function sendCb () {})
      stat = raw = rowraw = undefined
    }
  })
  // ping
  WebSocket.on(['rpcapi', 'ping', '/v1_0/init'], (headers) => {
    let stat = 'RPCAPI/1.0 200 OK'
    let raw = b.rowraw.stringify({
      'request_id': headers.request_id,
      'process_id': process.pid
    }, new Buffer(0), stat)
    this.send(raw, function sendCb () {})
  })
  // lists
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/lists'], (headers) => {
    if (!checkHeadersRequestId(headers)) {
      return
    }
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err, data) => {
      let body = new Buffer(b.toJSON(data || {}), 'utf-8')
      let raw = getRowrawByErrOrBody(headers.request_id, err, body)
      this.send(raw, function sendCb () {})
    }

    var masterError = false
    var lists
    var q = b.queue()
    q.end(function onEnd (state, res) {
      if (callback && b.type(callback, 'function')) {
        if (state) {
          callback(null, res)
        } else {
          callback(res)
        }
      }
      callback = undefined
    })
    q.push(function getLists (next) {
      daemon.siteManage.lists(function listsCb (e, l) {
        lists = l || {}
        next()
        l = e = undefined
      })
    })
    if (argv && argv.is_status) {
      q.push(true, function checkMasterInfo (next) {
        daemon.callMaster('processInfo', {}, function processInfoCb (state, message) {
          if (state) {
            // 进程内存
            message.memory = message && message.memoryUsage && message.memoryUsage.heapTotal || '0'
            // 状态
            message.status = message.status || 'Stoped'
            // 主线程正常
            masterError = false
          } else {
            message = {
              error_stack: message
            }
            // 进程内存
            message.memory = '0'
            // 状态
            message.status = 'ErrorMast'
            // 主线程异常
            masterError = true
          }
          // 进程名字
          message.name = '[ddv master]'
          // 系统进程id为-
          message.siteId = '-'
          message.debug = '[sys]'
          message.isError = masterError
          lists.unshift(message)
          message = void 0
          next()
        })
      })
      q.push(true, function checkDaemonInfo (next) {
        var info = {}
        info.memoryUsage = process.memoryUsage()
        info.pid = process.pid
        info.memory = info && info.memoryUsage && info.memoryUsage.heapTotal || '0'
        info.name = '[ddv daemon]'
        info.lastUptime = (daemon.startTimeStamp * 1000)
        info.siteId = '-'
        info.status = 'Runing'
        info.debug = '[sys]'
        lists.unshift(info)
        info = undefined
        next()
      })
    }
    q.push(true, function checkSiteInfo (next, success, fail) {
      if (argv && argv.is_status && masterError === false) {
        daemon.getSiteInfoByLists(lists, function getSiteInfoByListsCb (e) {
          if (e) {
            fail(e)
          } else {
            next()
          }
        })
      } else {
        if (masterError === true) {
          b.each(lists, function (index, site) {
            if (site.siteId === '-') {
              return
            }
            site.status = 'ErrorMast'
          })
        }
        next()
      }
    })
    q.push(true, function resCallback (next, success, fail) {
      success(lists)
    })
    // 运行队列
    q.run()
  })
  // add
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/add'], (headers) => {
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err) => {
      let raw = getRowrawByErrOrBody(headers.request_id, err, '{}')
      this.send(raw, function sendCb () {})
    }
    if (argv) {
      daemon.siteManage.add(argv, (err) => {
        if (!callback) { return }
        if (err) {
          callback(err)
        } else {
          callback(null)
        }
        callback = void 0
      })
    } else {
      let err = new Error('The command line argument can not be null')
      err.error_id = 'COMMAND_ARGV_ERROR'
      callback(err)
      callback = void 0
    }
  })
  // remove
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/remove'], (headers) => {
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err, removeLists) => {
      let raw = getRowrawByErrOrBody(headers.request_id, err, b.toJSON(removeLists || {}))
      this.send(raw, function sendCb () {})
    }
    if (argv) {
      daemon.siteManage.remove(argv, (err) => {
        if (!callback) { return }
        if (err) {
          callback(err)
        } else {
          callback(null)
        }
        callback = void 0
      })
    } else {
      let err = new Error('The command line argument can not be null')
      err.error_id = 'COMMAND_ARGV_ERROR'
      callback(err)
      callback = void 0
    }
  })
  // guid
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/guid'], (headers) => {
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err, removeLists) => {
      let raw = getRowrawByErrOrBody(headers.request_id, err, b.toJSON(removeLists || {}))
      this.send(raw, function sendCb () {})
    }
    if (argv) {
      // 如果有guid
      if (argv.set_guid) {
        console.log('argv', argv.set_guid)
        callback(new Error('暂不支持'))
        /* daemon.siteManage.remove(argv,(err)=>{
          if (!callback) {return ;}
          if (err) {
            callback(err);
          }else{
            callback(null,{
              guid:config.serverGuid
            });
          }
          callback = void 0 ;
        }); */
      } else {
        callback(null, {
          guid: config.serverGuid
        })
      }
    } else {
      let err = new Error('The command line argument can not be null')
      err.error_id = 'COMMAND_ARGV_ERROR'
      callback(err)
      callback = void 0
    }
  })

  /**
   * [kill 结束线程]
   * @author: 桦 <yuchonghua@163.com>
   * @DateTime 2016-09-12T15:40:57+0800
   * @param    {object}                 data     [description]
   * @param    {Function}               callback [description]
   */
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/kill'], (headers) => {
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err, killLists) => {
      let raw = getRowrawByErrOrBody(headers.request_id, err, b.toJSON(killLists || []))
      this.send(raw, function sendCb () {})
    }
    argv.pid = argv.pid || 0
    var isKillPid = false
    var r = []
    var q = b.queue()
    var pids = (argv.pid || '').toString().split(',')
    b.each(pids, function (index, processId) {
      if (processId && processId !== 0 && processId !== '0' && processId !== '') {
        isKillPid = true
        try {
          process.kill(processId)
          r[r.length] = {processId: processId, state: true}
        } catch (e) {
          r[r.length] = {processId: processId, state: false}
        }
      }
    })
    if (isKillPid === false) {
      q.push(function killRun (next) {
        daemon.kill(function killCb (pids) {
          b.each(pids, function (index, pidt) {
            try {
              process.kill(pidt[0])
              pidt.state = true
            } catch (e) {}
            r[r.length] = pidt
            index = pidt = undefined
          })
          next()
        })
      })
    }
    q.push(true, function killCb () {
      callback(null, r)
    })
    q.run()
  })
}
// 命令运行模块
module.exports = (WebSocket) => {
  commandEventBind.call(WebSocket, WebSocket)
}
