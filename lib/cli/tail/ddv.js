'use strict'
// ddv日志模块
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// 终止符号
const EOL = require('os').EOL
// 监听模块
const Tail = require('tail').Tail
// 子进程模块
const childProcess = require('child_process')
// 输出
const stdoutWrite = (data, isAppendEOL) => {
// 输出数据
  process.stdout.write(data)
  if (isAppendEOL) {
    // 输出换行
    process.stdout.write(EOL)
  }
}
// 监听的输出日志文件
const tailFileLog = config.DDV_OUT_LOG_FILE_PATH
// 监听的输出错误文件
const tailFileErr = config.DDV_ERR_LOG_FILE_PATH
// 导出模块
module.exports = function cmdTailDdv (type) {
  type = (type || 'all').toLowerCase()
  if (['log', 'err', 'error', 'all'].indexOf(type) < 0) {
    return
  }
  let Type = type.substring(0, 1).toUpperCase() + type.substring(1)
  // 重新定义命令行标题
  process.title = 'ddvCliTail' + Type
  // 打印开始监听
  log.info('cli.command.tail.watch_log_start')
  // 开始监听
  if (process.platform === 'win32' || process.platform === 'win64') {
    tailByNode(type)
  } else {
    tailByShellTail(type)
  }
}

let options = {
  separator: /[\r]{0,1}\n/,
  fromBeginning: false,
  fsWatchOptions: {},
  follow: true,
  // 使用文件监听模块
  useWatchFile: true
}

// 通过node的tail监听输出日志
function tailByNodeLog () {
  // 实例化监听模块
  let tail = new Tail(tailFileLog, options)
  // 打印每一行
  tail.on('line', (data) => {
    stdoutWrite(data, true)
  })
  // 监听出错了
  tail.on('error', (error) => {
    stdoutWrite('ERROR by node tail : ')
    console.error(error)
  })
  // 开始监听
  tail.watch()
  // 监听进程退出
  process.on('exit', () => {
    tail.unwatch()
    tail = void 0
  })
}
// 通过node的tail监听错误日志
function tailByNodeErr () {
  // 实例化监听模块
  let tail = new Tail(tailFileErr, options)
  // 打印每一行
  tail.on('line', (data) => {
    stdoutWrite(data, true)
  })
  // 监听出错了
  tail.on('error', (error) => {
    stdoutWrite('ERROR by node tail : ')
    console.error(error)
  })
  // 开始监听
  tail.watch()
  // 监听进程退出
  process.on('exit', () => {
    tail.unwatch()
    tail = void 0
  })
}
let isStdout = false
// 通过shell的tail监听输出日志
function tailByShellTailLog (type) {
  let tail = childProcess.spawn('tail', ['-f', tailFileLog])
  tail.stdout.on('data', (data) => {
    isStdout = true
    stdoutWrite(data)
  })

  tail.stderr.on('data', (data) => {
    if (isStdout === true) {
      stdoutWrite('ERROR by node shell : ')
      console.error(data)
    }
  })

  tail.on('close', (code) => {
    if (isStdout === false) {
      tailByNode(type)
    } else {
      process.exit(config.SUCCESS_EXIT)
    }
  })
  process.on('exit', () => {
    try {
      tail.kill()
    } catch (e) {}
  })
}
// 通过shell的tail监听错误日志
function tailByShellTailErr (type) {
  let tail = childProcess.spawn('tail', ['-f', tailFileErr])
  tail.stdout.on('data', (data) => {
    isStdout = true
    stdoutWrite(data)
  })

  tail.stderr.on('data', (data) => {
    if (isStdout === true) {
      stdoutWrite('ERROR by node shell : ')
      console.error(data)
    }
  })

  tail.on('close', (code) => {
    if (isStdout === false) {
      tailByNode(type)
    } else {
      process.exit(config.SUCCESS_EXIT)
    }
  })
  process.on('exit', () => {
    try {
      tail.kill()
    } catch (e) {}
  })
}
// 通过node的tail监听日志
function tailByNode (type) {
  if (type === 'all' || type === 'log') {
    tailByNodeLog()
  }
  if (type === 'all' || type === 'err' || type === 'error') {
    tailByNodeErr()
  }
}
// 通过shell的tail监听日志
function tailByShellTail (type) {
  if (type === 'all' || type === 'log') {
    tailByShellTailLog(type)
  }
  if (type === 'all' || type === 'err' || type === 'error') {
    tailByShellTailErr(type)
  }
}
