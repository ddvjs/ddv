'use strict'
const debug = require('debug')('ddv/daemon/start')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// api接口
const Api = require(ddvPath('lib/api'))
// 日志模块
const log = require(ddvPath('lib/log'))
// 工具模块
const util = require('ddv-worker/util')
// 文件系统模块
const fs = require('fs')
// 子进程模块
const childProcess = require('child_process')
// 守护进程
const Satan = module.exports = function startDaemon () {
  debug('startDaemon')
  return config.getConfig()
  .then(() => {
    // 试图连接守护进程
    return new Api({
      address: config.address,
      rpcTimeout: config.rpcTimeout
    }).then(api => {
      debug('存在守护线程，断开服务，跳过启动')
      return api.disconnect()
    }).catch(() => {
      debug('不存在守护线程，试图启动')
      return Satan.launchDaemon()
    })
  })
}
/**
 * 启动后台守护进程
 * @author: 桦 <yuchonghua@163.com>
 * @DateTime 2017-01-23T00:14:54+0800
 * @return   {[type]}                 [description]
 */
Satan.launchDaemon = function launchDaemon () {
  return config.getConfig()
  .then(() => {
    // winNt内核
    if (config.platform === 'win32' || config.platform === 'win64') {
      return Satan.launchDaemonByWin()
    } else {
    // Unix内核
      return Satan.launchDaemonByUnix()
    }
  })
}
// 启动后台守护线程 winNt内核
Satan.launchDaemonByWin = function launchDaemonByWin (callback) {
  return new Promise(function launchDaemonRun (resolve, reject) {
   // console.log('呵呵', username)
    let config = {}
    config.DDV_DAEMON_RPC_PORT = '\\\\.\\pipe\\daemon.rpc.ddv.sock'
    console.log('休息休息', callback)
    console.log(process.argv[0])
    console.log(process.argv[1])
    let http = require('http')

    let httpx = http.createServer(function (req, res) {
      res.end('Hello World\n')
    })
  // 绑定端口
    httpx.listen(config.DDV_DAEMON_RPC_PORT, function () {
      console.log('绑定了', config.DDV_DAEMON_RPC_PORT)
    // 赋予管道权限
      fs.chmod(config.DDV_DAEMON_RPC_PORT, '666', function chmodCb (e) {
        console.log('666了', config.DDV_DAEMON_RPC_PORT, e)
      // if (callback) {
      //  callback(e);
      //  callback = undefined ;
      // }
      // 修改权限
        fs.access(config.DDV_DAEMON_RPC_PORT, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK, function (err) {
          console.log('access了', config.DDV_DAEMON_RPC_PORT, err)
          console.log(err ? 'no access!' : 'can read/write')
          console.log(777)
          fs.stat(config.DDV_DAEMON_RPC_PORT, function (a, b, c) {
            console.log(888)
            console.log(a, b, c)
          })
        })
      })
    })
  })
}
// 启动后台守护线程 Unix内核
Satan.launchDaemonByUnix = function launchDaemonByUnix (callback) {
  var onChildError, onChildMessage, onChildExit, child
  var onEnd = function () {
    if (child) {
      // 试图解除错误事件绑定
      try { child.removeListener('error', onChildError) } catch (e) {}
      try { child.removeListener('disconnect', onChildExit) } catch (e) {}
      try { child.removeListener('exit', onChildExit) } catch (e) {}
      try { child.removeListener('close', onChildExit) } catch (e) {}
      try { child.removeListener('message', onChildMessage) } catch (e) {}
    }
    onChildError = onChildMessage = onChildExit = child = void 0
  }
  return new Promise(function launchDaemonRun (resolve, reject) {
    var out, err, isFs
    if (process.env.TRAVIS) {
      // Redirect DDV
      //  internal err and out to STDERR STDOUT when running with Travis
      out = 1
      err = 2
      isFs = false
    } else {
      out = fs.openSync(config.DDV_OUT_LOG_FILE_PATH, 'a')
      err = fs.openSync(config.DDV_ERR_LOG_FILE_PATH, 'a')
      isFs = true
    }

    log.debug('user home path: ' + config.homePath)
    log.debug('DDV home path: ' + config.ddvHomePath)

    // 启动守护线程
    child = childProcess.spawn(
      // 命令行运行文件
      (process.argv[0] || config.execPath || process.execPath || 'node'),
      // 命令行传参
      [
        // 垃圾回收模块
        '--expose-gc',
        (process.argv[1] || ddvPath('bin/ddv')),
        // 后台守护进程，直接启动
        '--no-run-daemon',
        // 输出颜色
        '--color'
      ],
      // 配置项
      {
        // 子进程将会被作为新进程组的leader
        detached: true,
        // 工作目录
        cwd: config.cwd,
        // 环境变量
        env: Object.assign({
          'SILENT': config.DEBUG ? !config.DEBUG : true,
          // home目录
          'HOME': config.homePath,
          // home目录
          'HOME_PATH': config.homePath,
          // ddv入口文件
          'DDV_MAIN_FILE': config.ddvMainFile,
          // 配置文件目录
          'DDV_CONFIG_PATH': config.ddvConfigPath,
          // 服务器guid
          'SERVER_GUID': config.serverGuid,
          // node运行路径
          'NODE_PATH': config.execPath,
          // 日志输出
          'DDV_OUT_LOG_FILE_PATH': config.DDV_OUT_LOG_FILE_PATH,
          // 错误日志输出
          'DDV_ERR_LOG_FILE_PATH': config.DDV_ERR_LOG_FILE_PATH,
          // 使用颜色
          'DEBUG_COLORS': true
        }, process.env),
        // 输入输出
        stdio: ['ipc', out, err]
        // Number 设置用户进程的ID
        // uid:,
        // Number 设置进程组的ID
        // gid:
      }
    )
    // 关闭指针
    if (isFs) {
      out = fs.closeSync(out)
      err = fs.closeSync(err)
    }

    // 错误事件
    onChildError = function onChildError (e) {
      reject(e)
    }
    // 消息事件
    onChildExit = function onChildExit (code, signal) {
      reject(new Error(signal || ('exit code:' + code)))
    }
    // 消息事件
    onChildMessage = function onChildMessage (res) {
      if (!(res && res.type && res.data && res.type === 'ddvDaemonStartEnd')) {
        return
      }
      try {
        // 试图断开ipc连接
        child.disconnect()
      } catch (e) {}

      if (res.data.state === true) {
        resolve()
      } else {
        var err = new Error(res.data.message || '')
        err.stack = res.data.stack + '\n' + err.stack
        reject(err)
      }
    }
    // 错误绑定
    child.once('error', onChildError)
    // 断开连接绑定
    child.once('disconnect', function () {
      setTimeout(() => {
        return onChildExit && util.isFunction(onChildExit) && onChildExit()
      }, 300)
    })
    // 退出绑定
    child.once('exit', onChildExit)
    // 关闭绑定
    child.once('close', onChildExit)
    // 绑定信息
    child.on('message', onChildMessage)
    // 父进程的事件循环引用计数中去除这个子进程
    child.unref()
  }).then(function (res) {
    onEnd()
    return res
  }).catch(function (e) {
    onEnd()
    throw e
  })
}
