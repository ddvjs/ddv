'use strict'
const debug = require('debug')('ddv/server/command')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 配置项
const config = require(ddvPath('lib/config'))
// getDaemon模块
const getDaemon = require(ddvPath('lib/daemon/getDaemon'))
// 站点管理模块
const siteManage = require(ddvPath('lib/site/manage.js'))
// rowraw
const Rowraw = require('ddv-rowraw')
// 日志模块
const log = require(ddvPath('lib/log'))
// 日志模块
const server = require(ddvPath('lib/server'))
// 通过头中提取argv
const getCommandArgvByHeaders = (headers) => {
  debug('getCommandArgvByHeaders', headers)
  var argv = null
  if (headers && typeof headers === 'object' && headers.command_argv) {
    try {
      argv = JSON.parse(headers.command_argv)
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
    body = typeof body === 'string' ? (new Buffer(body, 'utf-8')) : (new Buffer(0))
  }
  if (typeof headers !== 'object') {
    let headersTemp = Object.create(null)
    headersTemp.request_id = typeof headers === 'string' ? headers : ''
    headers = headersTemp
    headersTemp = void 0
  }
  if (err) {
    stat = 'RPCAPI/1.0 400 ' + (err.error_id || err.message || 'Unknow Error')
    headers.error_stack = err.stack
    headers.error_message = err.message
  } else {
    stat = 'RPCAPI/1.0 200 OK'
  }
  raw = Rowraw.stringify(headers, body, stat)
  headers = body = stat = void 0
  return raw
}
// 通过头中提取argv
const checkHeadersRequestId = (headers) => {
  debug('checkHeadersRequestId', headers)
  if (headers && typeof headers === 'object' && headers.request_id) {
    headers = void 0
    return true
  }
  headers = void 0
  return false
}
// 绑定事件
const commandEventBind = function commandEventBind (WebSocket) {
  debug('commandEventBind')
  // rpcapi事件转发
  WebSocket.on('protocol::rpcapi', (rowraw) => {
    debug('protocol::rpcapi', rowraw)
    if (!(rowraw.method && rowraw.path && this.emit(['rpcapi', rowraw.method.toLowerCase(), rowraw.path], rowraw.headers, rowraw.body, rowraw))) {
      let stat = 'RPCAPI/1.0 404 Not Found'
      let raw = Rowraw.stringify({
        'request_id': rowraw.headers.request_id
      }, new Buffer(0), stat)
      this.send(raw, function sendCb () {})
      stat = raw = rowraw = undefined
    }
  })
  // ping
  WebSocket.on(['rpcapi', 'ping', '/v1_0/init'], (headers) => {
    debug('protocol::rpcapi::ping::/v1_0/init', headers)
    let stat = 'RPCAPI/1.0 200 OK'
    let raw = Rowraw.stringify({
      'request_id': headers.request_id,
      'process_id': process.pid
    }, new Buffer(0), stat)
    this.send(raw, function sendCb () {})
  })
  // lists
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/lists'], (headers) => {
    debug('rpcapi::command::lists')
    if (!checkHeadersRequestId(headers)) {
      return
    }
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err, data) => {
      let body = new Buffer(JSON.stringify(data || {}), 'utf-8')
      let raw = getRowrawByErrOrBody(headers.request_id, err, body)
      this.send(raw, function sendCb () {})
    }
    var isGetStatus = argv && argv.is_status || false
    var masterError = false
    var lists = []
    debug('rpcapi::command::lists -- getDaemonObj')
    getDaemon().then(daemon => {
      if (!isGetStatus) {
        // 如果不需要查询状态就直接跳过查询主进程和守护进程的信息
        return Promise.resolve(daemon)
      }
      debug('rpcapi::command::lists -- getMaster -- getDaemon')
      return Promise.all([
        daemon.callMaster('getProcessInfo', {}).then(({data}) => {
          // 进程内存
          data.memory = data && data.memoryUsage && data.memoryUsage.heapTotal || '0'
          // 状态
          data.status = data.status || 'Stoped'
          // 主线程正常
          data.isError = false
          // 返回
          return data
        }, ({name, type, stack}) => {
          console.log('stack', stack)
          let data = {
            // 错误名字
            errorName: name,
            // 错误类型
            errorType: type,
            // 错误栈
            errorStack: stack,
            // 进程内存
            memory: '0',
            // 状态
            status: 'ErrorMast',
            // 主线程异常
            isError: true
          }
          // 返回
          return data
        }).then(data => {
          debug('rpcapi::command::lists -- getMaster -- cb')
          // 进程名字
          data.name = '[ddv master]'
          // 系统进程id为-
          data.siteId = '-'
          data.debug = '[sys]'
          masterError = data.isError
          return data
        }),
        new Promise((resolve, reject) => {
          debug('rpcapi::command::lists -- getDaemon')
          // 查询daemon状态
          var info = {}
          info.memoryUsage = process.memoryUsage()
          info.pid = process.pid
          info.memory = info && info.memoryUsage && info.memoryUsage.heapTotal || '0'
          info.name = '[ddv daemon]'
          info.lastUptime = (daemon.startTimeStamp * 1000)
          info.siteId = '-'
          info.status = 'Runing'
          info.debug = '[sys]'
          resolve(info)
          info = void 0
        })
      ]).then(([daemonInfo, masterInfo]) => {
        lists.unshift(daemonInfo, masterInfo)
        return daemon
      })
    }).then(daemon => {
      debug('rpcapi::command::lists -- siteManage -- getLists')
      // 获取站点列表
      return siteManage.lists().then(siteLists => {
        debug('rpcapi::command::lists -- siteManage -- getLists -- res', siteLists)
        if (isGetStatus && masterError === false) {
          debug('rpcapi::command::lists -- isGetStatus')
          return daemon.getSiteInfoByLists(siteLists)
        } else {
          debug('rpcapi::command::lists -- isGetStatus=false')
          masterError === true &&
          Array.isArray(siteLists) &&
          siteLists.forEach(site => {
            site.siteId === '-' || (site.status = 'ErrorMast')
          })
          return siteLists
        }
      }).then(siteLists => {
        debug('rpcapi::command::lists -- siteManage -- getLists -- cb', siteLists)
        lists.push.apply(lists, siteLists)
      })
    }).then(() => { callback && callback(null, lists) }, e => { callback && callback(e, null) })
  })
  // add
  WebSocket.on(['rpcapi', 'command', '/v1_0/command/add'], (headers) => {
    let argv = getCommandArgvByHeaders(headers)
    let callback = (err) => {
      let raw = getRowrawByErrOrBody(headers.request_id, err, '{}')
      this.send(raw, function sendCb () {})
    }
    if (argv) {
      siteManage.add(argv).then(() => { callback && callback(null, null) }, e => { callback && callback(e, null) })
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
      let raw = getRowrawByErrOrBody(headers.request_id, err, JSON.stringify(removeLists || {}))
      this.send(raw, function sendCb () {})
    }
    if (argv) {
      siteManage.remove(argv).then(() => { callback && callback(null, null) }, e => { callback && callback(e, null) })
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
      let raw = getRowrawByErrOrBody(headers.request_id, err, JSON.stringify(removeLists || {}))
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
      let raw = getRowrawByErrOrBody(headers.request_id, err, JSON.stringify(killLists || []))
      this.send(raw, function sendCb () {})
    }
    argv.pid = argv.pid || 0
    var isKillPid = false
    var r = []
    var pids = (argv.pid || '').toString().split(',')
    Array.isArray(pids) && pids.forEach(pid => {
      if (pid && pid !== 0 && pid !== '0' && pid !== '') {
        isKillPid = true
        try {
          process.kill(pid)
          r[r.length] = {type: 'killpid', pid: pid, state: true}
        } catch (e) {
          r[r.length] = {type: 'killpid', pid: pid, state: false}
        }
      }
    })
    getDaemon().then(daemon => {
      if (isKillPid === false) {
        return server.close().catch(e => {
        // return Promise.resolve().catch(e => {
          log.error(new Error('关闭出错'))
        }).then(res => {
          return daemon.kill()
        }).then(lists => {
          console.log(44, lists)
        })
      }
    }).then(() => { callback && callback(null, r) }, e => { callback && callback(e, null) })
  })
}
// 命令运行模块
module.exports = (WebSocket) => {
  commandEventBind.call(WebSocket, WebSocket)
}
