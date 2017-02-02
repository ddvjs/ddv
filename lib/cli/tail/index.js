'use strict'
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
// 工具
const util = require('ddv-worker/util')

/**
 * 监听文件末尾变化
 */
commander
.command('tail [site_name] [error|log|all]')
.description(log.t('cli.help.command.tail'))
.action(function (tailType, logType) {
  if (!logType && util.type(tailType, 'string') && (['all', 'log', 'err', 'error'].indexOf(tailType) > -1)) {
    cmdTailDdv(tailType)
  } else if (!tailType && !logType) {
    cmdTailDdv('all')
  } else if (!tailType && tailType.length > 0) {
    console.log('暂时不支持监听站点')
  } else {
    // 输出帮助
    commander.parse([commander.argv_source[0], commander.argv_source[1], 'tail', '--help'])
  }
})

function cmdTailDdv (type) {
  type = (type || 'all').toLowerCase()
  if (['log', 'err', 'error', 'all'].indexOf(type) < 0) {
    log.error('cli.command.tail.not_supported').then(() => {
      commander.parse([commander.argv_source[0], commander.argv_source[1], 'tail', '--help'])
    })
    return
  }
  let Type = type.substring(0, 1).toUpperCase() + type.substring(1)
  // 重新定义命令行标题
  process.title = 'ddvCliTail' + Type

  let EOL = require('os').EOL

  let options = {
    separator: /[\r]{0,1}\n/,
    fromBeginning: false,
    fsWatchOptions: {},
    follow: false,
    // 使用文件监听模块
    useWatchFile: true
  }
  // 监听模块
  let Tail = require('tail').Tail
  // 监听的输出日志文件
  let tailFileLog = config.DDV_OUT_LOG_FILE_PATH
  // 监听的输出错误文件
  let tailFileErr = config.DDV_ERR_LOG_FILE_PATH
  // 打印开始监听
  log.info('cli.command.tail.watch_log_start')

  let stdoutWrite = (data, isAppendRN) => {
    process.stdout.write(data)
    if (isAppendRN) {
      process.stdout.write(EOL)
    }
  }
  // 通过node的tail监听输出日志
  let tailByNodeLog = () => {
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
    })
  }
  // 通过node的tail监听错误日志
  let tailByNodeErr = () => {
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
    })
  }
  let isStdout = false
  // 通过shell的tail监听输出日志
  let tailByShellTailLog = () => {
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
        tailByNode()
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
  let tailByShellTailErr = () => {
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
        tailByNode()
      } else {
        process.exit(config.SUCCESS_EXIT)
      }
    })
    process.on('exit', () => {
      try {
        tail.kill()
        console.log('4344')
      } catch (e) {
        console.log('呵呵', e)
      }
    })
  }
  // 通过node的tail监听日志
  let tailByNode = () => {
    if (type === 'all' || type === 'log') {
      tailByNodeLog()
    }
    if (type === 'all' || type === 'err' || type === 'error') {
      tailByNodeErr()
    }
  }
  // 通过shell的tail监听日志
  let tailByShellTail = () => {
    if (type === 'all' || type === 'log') {
      tailByShellTailLog()
    }
    if (type === 'all' || type === 'err' || type === 'error') {
      tailByShellTailErr()
    }
  }
  // 开始监听
  if (process.platform === 'win32' || process.platform === 'win64') {
    tailByNode()
  } else {
    tailByShellTail()
  }
}
