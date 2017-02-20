'use strict'
// ddv路径模块
const getDaemon = require('./getDaemon')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 工具模块
const util = require('ddv-worker/util')
// 日志模块
const log = require(ddvPath('lib/log'))
// 站点管理模块
const siteManage = require(ddvPath('lib/site/manage.js'))
module.exports = function eventBind () {
  return getDaemon().then(daemon => {
    // 绑定关闭事件
    closeEventInit(daemon)
    // 守护事件
    daemonEventInit(daemon)
  })
}

// 关闭事件初始化
function closeEventInit (daemon) {
  // 监听异常
  process.on('uncaughtException', function () {
    return uncaughtException.apply(daemon, arguments)
  })
  // 监听结束
  process.on('beforeExit', function () {
    return closeEvent.apply(daemon, ['beforeExit'].concat(util.argsToArray(arguments)))
  })
  // 监听结束
  process.on('exit', function () {
    return closeEvent.apply(daemon, ['exit'].concat(util.argsToArray(arguments)))
  })
  // 终止进程-软件终止信号
  // SIGTERM是杀或的killall命令发送到进程默认的信号。
  // 它会导致一过程的终止，但是SIGKILL信号不同，它可以被捕获和解释（或忽略）的过程。
  // 因此，SIGTERM类似于问一个进程终止可好，让清理文件和关闭。
  // 因为这个原因，许多Unix系统关机期间，
  // 初始化问题SIGTERM到所有非必要的断电过程中，等待几秒钟，
  // 然后发出SIGKILL强行终止仍然存在任何这样的过程。
  process.on('SIGTERM', function () {
    return closeEvent.apply(daemon, ['SIGTERM'].concat(util.argsToArray(arguments)))
  })
  // 终止进程-中断进程  通常是Ctrl-C
  process.on('SIGINT', function () {
    return closeEvent.apply(daemon, ['SIGINT'].concat(util.argsToArray(arguments)))
  })
  // 终止进程-中断进程  通常是Ctrl-\
  // 和SIGINT类似, 但由QUIT字符(通常是Ctrl-\)来控制. 进程在因收到SIGQUIT退出时会产生core文件, 在这个意义上类似于一个程序错误信号
  process.on('SIGQUIT', function () {
    return closeEvent.apply(daemon, ['SIGQUIT'].concat(util.argsToArray(arguments)))
  })
  // SIGHUP SIGHUP SIGHUP SIGHUP
  process.on('SIGHUP', function () {
    return closeEvent.apply(daemon, ['SIGHUP'].concat(util.argsToArray(arguments)))
  })
  // 上符合POSIX平台上，SIGKILL是发送到处理的信号以使其立即终止。
  // 当发送到程序，SIGKILL使其立即终止。
  // 在对比SIGTERM和SIGINT，这个信号不能被捕获或忽略，并且在接收过程中不能执行任何清理在接收到该信号。
  process.on('SIGILL', function () {
    if (global.gc && typeof global.gc === 'function') {
      try {
        global.gc()
      } catch (e) {}
    }
  })
}
// 守护线程异常了
function uncaughtException (err) {
  log.error(err)
}
// 守护线程将要关闭了
function closeEvent (type) {
  log.info('daemon.closeEventTip', (type || 'UNKNOWN_EXIT'))
  closeEventRun.call(this, type)
}
// 守护线程将要关闭
function closeEventRun (type) {
  if (this.isDdvCloseing === true) {
    return
  } else {
    this.isDdvCloseing = true
  }
  // 触发事件
  this.emit('ddvDaemonClose', type)
  process.exit(0)
}
function daemonEventInit (daemon) {
  // master 向该线程[守护线程] 获取站点列表信息
  daemon.onMasterCall('getSiteLists', (data, handle) => {
    return siteManage.lists().then(data => ({data}))
  })
}

