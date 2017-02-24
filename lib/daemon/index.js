'use strict'
const debug = require('debug')('ddv/daemon/index')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// api接口
const Api = require(ddvPath('lib/api'))
// 后台守护进程模块
const DdvDaemon = require('ddv-worker/daemon')
// 工具模块
const util = require('ddv-worker/util')
// 日志模块
const log = require(ddvPath('lib/log'))
// 事件绑定
const eventBind = require(ddvPath('lib/daemon/eventBind.js'))
// api接口
const daemonApi = require(ddvPath('lib/daemon/api.daemon.js'))
// rpc远程调用模块
const server = require(ddvPath('lib/server'))
// 是否存在守护进程
var isRepeatDaemon = false
// 判断是否需要强制停止原来的守护进程，
// 启动新的守护进程
const isStopRepeatDaemonRestart = process.env.STOP_REPEAT_DDV_DAEMON_RESTART || process.argv.indexOf('--stop-repeat-ddv-daemon-restart') > -1

const isHasParentProcess = () => {
  return process.connected && process.send && util.isFunction(process.send)
}
// 获取配置信息
module.exports = config.getConfig()
.then(() => {
  debug('试图建立连接-连接后台守护进程')
  return new Api({
    address: config.address,
    rpcTimeout: config.rpcTimeout
  }).then((api) => {
    debug('判断是否强制要求断开原来的守护进程')
    if (isStopRepeatDaemonRestart) {
      debug('执行停止原来的守护进程')
      return api.kill().then(() => {
        debug('执行杀掉守护进程成功')
        return true
      }, e => {
        debug('执行杀掉守护进程失败，暂时不做其他逻辑，视为杀掉成功处理')
        return true
      }).then(() => {
        debug('既然都杀掉了', '标记不存在守护线程')
        isRepeatDaemon = false
        debug('断开服务')
        return api.disconnect()
      })
    } else {
      debug('标记存在守护线程')
      isRepeatDaemon = true
      debug('断开服务')
      return api.disconnect()
    }
  }, e => {
    debug('没有成功连接到守护进程', '标记不存在守护进程')
    isRepeatDaemon = false
  }).then(() => {
    var daemon
    debug('如果有守护进程就不启动它了')
    if (isRepeatDaemon) {
      return
    }
    debug('异步启动 新守护进程')
    return new Promise((resolve, reject) => {
      // 标题
      process.title = 'ddv v' + config.version + ': Daemon God'
      debug('运行后台守护模块', '主线程模块')
      daemon = new DdvDaemon()
      daemon.serverGuid = config.serverGuid
      debug('指向全局模块')
      global.daemon = daemon
      resolve()
    }).then(() => {
      debug('eventBind')
      return eventBind()
    }).then(() => {
      debug('daemonApi')
      return daemonApi()
    }).then(() => {
      debug('ddvDaemonClose')
      daemon.on('ddvDaemonClose', () => {
        server.close().catch(e => {
          debug('ddvDaemonCloseCatch')
        })
      })
      debug('server.open')
      return server.open().then(() => {
        log.info('daemon.server.api')
      })
    }).then(() => {
      debug('启动主管理线程')
      // 设置管理线程启动文件
      daemon.setMasterFile(ddvPath('lib/master/index.js'))
      // 运行服务器
      daemon.run()
    })
  })
}).then(() => {
  // 返回启动成功
  if (isHasParentProcess()) {
    process.send({
      type: 'ddvDaemonStartEnd',
      data: {
        state: true,
        is_repeat_daemon: isRepeatDaemon,
        message: 'OK',
        stack: ''
      }
    })
    process.disconnect()
  } else {
    return (isRepeatDaemon ? log.info('daemon.run.repeat') : Promise.resolve()).then(() => {
      return log.tip(' OK ', 'daemon.run.succss')
    })
  }
}, e => {
  // 返回启动失败
  if (isHasParentProcess()) {
    process.send({
      type: 'ddvDaemonStartEnd',
      data: {
        state: false,
        is_repeat_daemon: isRepeatDaemon,
        message: e.message || 'unknow error',
        stack: e.stack || Error('unknow error').stack
      }
    })
    process.disconnect()
  } else {
    return (isRepeatDaemon ? log.info('daemon.run.repeat') : Promise.resolve()).then(() => {
      log.tip('FAIL', 'daemon.run.fail').then(() => {
        process.exit(1)
      })
    })
  }
})
