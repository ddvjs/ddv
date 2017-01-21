'use strict'
// cjbbase模块
const cjbbase = require('cjb-base')
// b模块
const b = cjbbase.inherit(cjbbase)
// 文件系统模块
const fs = require('fs')
// 文件路径
const path = require('path')
// 日志
const log = require('../log')
// api接口
const Api = require('../api/index.js')
// 子进程
const childProcess = require('child_process')
var config, username
// 内部对象
const fn = {}
// 对外api
const Satan = module.exports = function daemonSatan () {
  // 返回结果
  return Satan.start.apply(Satan, arguments)
}
Satan.pingDaemon = function daemonPing (callback) {
  try {
    if (!config) {
      Satan.getConfig()
    }
    // 检测后台线程
    let api = new Api((err, pid) => {
      if ((!err) && pid) {
        try { api.disconnect() } catch (err) {}
      }
      callback(err, pid)
    })
  } catch (err) {
    if (callback && b.type(callback, 'function')) {
      callback(err)
    }
  }
}
Satan.start = function daemonStart (callback) {
  var q
  q = cjbbase.queue()
    // 成功
  q.end(function onEnd (state, res) {
    if (!q) { return }
    if (callback && cjbbase.type(callback, 'function')) {
      if (state) {
        callback(null)
      } else {
        callback(res)
      }
    }
    q = state = res = callback = void 0
  })
    // 检测试验有config配置信息
  q.push(function checkConfig (next, success, fail) {
    if (!next) { return }
    if (!config) {
      try {
        Satan.getConfig()
        next()
      } catch (e) {
        fail(e)
      }
    } else {
      next()
    }
    next = success = fail = void 0
  })
    // 试图检测是否存在后台线程
  q.push(true, function pingDaemon (next, success) {
    Satan.pingDaemon((err, pid) => {
      if (!next) { return }
      if (err) {
        next()
      } else {
        success()
      }
      next = success = err = pid = void 0
    })
  })
    // 启动后台线程
  q.push(true, function launchDaemon (next, success, fail) {
    Satan.launchDaemon(function launchDaemonCb (err) {
      if (!next) { return }
      if (err) {
        fail(err)
      } else {
        success()
      }
      next = success = fail = void 0
    })
  })
    // 运行模块
  q.run()
}
Satan.launchDaemon = function launchDaemon (callback) {
  if (!config) {
    Satan.getConfig()
  }
  if (!config) {
    try {
      // 试图获取配置信息
      Satan.getConfig()
    } catch (e) {
      // 报错
      if (callback && cjbbase.type(callback, 'function')) {
        callback(e)
        return
      } else {
        throw e
      }
    }
  }
  // winNt内核
  if (config.platform == 'win32' || config.platform == 'win64') {
    fn.launchDaemonByWin(callback)
  } else {
  // Unix内核
    fn.launchDaemonByUnix(callback)
  }

  callback = void 0
}

// 启动后台守护线程 winNt内核
fn.launchDaemonByWin = function launchDaemonByWin (callback) {
  console.log('呵呵')
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
}
// 启动后台守护线程 Unix内核
fn.launchDaemonByUnix = function launchDaemonByUnix (callback) {
  var q, onChildError, onChildMessage, onChildExit, child
  q = cjbbase.queue()
  // 成功
  q.onEnd(function onEnd () {
    if (callback && cjbbase.type(callback, 'function')) {
      callback(null)
    }
    if (child) {
      // 试图解除错误事件绑定
      try { child.removeListener('error', onChildError) } catch (e) {}
      try { child.removeListener('disconnect', onChildExit) } catch (e) {}
      try { child.removeListener('exit', onChildExit) } catch (e) {}
      try { child.removeListener('close', onChildExit) } catch (e) {}
      try { child.removeListener('message', onChildMessage) } catch (e) {}
    }
    q = onChildError = onChildMessage = onChildExit = child = void 0
  }).onError(function onError (err) {
  // 失败
    if (callback && cjbbase.type(callback, 'function')) {
      if (cjbbase.type(err, 'string')) {
        err = new Error(err)
      }
      callback(err)
    }
    if (child) {
      // 试图解除错误事件绑定
      try { child.removeListener('error', onChildError) } catch (e) {}
      try { child.removeListener('disconnect', onChildExit) } catch (e) {}
      try { child.removeListener('exit', onChildExit) } catch (e) {}
      try { child.removeListener('close', onChildExit) } catch (e) {}
      try { child.removeListener('message', onChildMessage) } catch (e) {}
    }
    q = onChildError = onChildMessage = onChildExit = child = void 0
  })
  // 检测试验有config配置信息
  q.push(function checkConfig (next) {
    if (!config) {
      try {
        Satan.getConfig()
        next()
      } catch (e) {
        return q && q.error && q.error(e)
      }
    } else {
      next()
    }
    // 是否开启调试模式
    log.DEBUG = config.DEBUG || false
    // 设置语言
    log.LOCALE = config.locale
    // 设置语言文件
    log.langsFile = 'daemon.ddv.js'
  })
  // 检测试验有config配置信息
  q.push(true, function launchDaemonRun (next) {
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
      (process.argv[0] || process.execPath),
      // 命令行传参
      [
        '--expose-gc',
        (process.argv[1] || path.resolve(__dirname, '../../bin/ddv.js')),
        '--no-run-daemon',
        '--color'
      ],
      // 配置项
      {
        // 子进程将会被作为新进程组的leader
        detached: true,
        // 工作目录
        cwd: config.cwd,
        // 环境变量
        env: cjbbase.extend(true, {
          'SILENT': config.DEBUG ? !config.DEBUG : true,
          'HOME': config.homePath,
          'DDV_PATH': config.ddvMainFile,
          'DDV_CONFIG_PATH': config.ddvConfigPath,
          'DDV_HOME_PATH': config.ddvHomePath,
          'HOME_PATH': config.homePath,
          'NODE_PATH': config.execPath,
          'DDV_OUT_LOG_FILE_PATH': config.DDV_OUT_LOG_FILE_PATH,
          'DDV_ERR_LOG_FILE_PATH': config.DDV_ERR_LOG_FILE_PATH
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
      if (q && q.error && cjbbase.type(q.error, 'function')) {
        q.error(e)
      }
    }
    // 消息事件
    onChildExit = function onChildExit (code, signal) {
      if (q && q.error && cjbbase.type(q.error, 'function')) {
        q.error(new Error(signal || ('exit code:' + code)))
      }
    }
    // 消息事件
    onChildMessage = function onChildMessage (res) {
      if (!(res && res.type && res.data && res.type === 'daemon_start_end')) {
        return
      }
      try {
        // 试图断开ipc连接
        child.disconnect()
      } catch (e) {}
      if (!q) {
        return
      }
      if (res.data.state === true) {
        q.end()
      } else {
        var err = new Error(res.data.message || '')
        err.stack = err.stack + '\n' + res.data.stack
        q.error(err)
      }
    }
    // 错误绑定
    child.once('error', onChildError)
    // 断开连接绑定
    child.once('disconnect', function () {
      setTimeout(function () {
        return onChildExit && cjbbase.type(onChildExit, 'function') && onChildExit()
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
  })
  // 运行队列
  q.run()
}

// 配置
Satan.getConfig = function setConfig () {
  if (!config) {
    config = require('../config')
  }
  return config
}
Satan.setConfig = function setConfig (c) {
  config = c
}
// 用户名
Satan.setUserName = function setUserName (u) {
  username = u
}
