'use strict'
const debug = require('debug')('ddv/sys/user')
// 子进程模块
const childProcess = require('child_process')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 工具模块
const util = require('ddv-worker/util')
// 日志模块
const log = require(ddvPath('lib/log'))
// 导出用户模块
const user = module.exports = {
  // 获取用户id
  getUid () {
    var uid = util.isFunction(process.getuid) && process.getuid() || 0
    return Promise.resolve(uid)
  },
  // 获取用户名
  getUsername () {
    return new Promise((resolve, reject) => {
      // 尝试通过 whoami 命令行获取 用户名
      childProcess.exec('whoami', (error, stdout, stderr) => {
        if (error) {
          reject(error)
          debug(`getUsername exec error: ${error}`)
          return
        } else {
          debug(`getUsername - stdout: ${stdout}`)
          debug(`getUsername - stderr: ${stderr}`)
          let username = stdout && stdout.length > 0 ? stdout.toString().trim() : ''
          username ? resolve(username) : reject(new Error('get username fail'))
          username = void 0
        }
      })
    }).catch(e => {
      return new Promise((resolve, reject) => {
        // 尝试通过 id -un 命令行获取 用户名
        childProcess.exec('whoami', (error, stdout, stderr) => {
          if (error) {
            reject(error)
            debug(`getUsername exec error: ${error}`)
            return
          } else {
            debug(`getUsername - stdout: ${stdout}`)
            debug(`getUsername - stderr: ${stderr}`)
            let username = stdout && stdout.length > 0 ? stdout.toString().trim() : ''
            username ? resolve(username) : reject(new Error('get username fail'))
            username = void 0
          }
        })
      })
    })
  },
  // 判断是否为管理员权限
  isRootAcc () {
    // 根据系统判断
    switch (process.platform) {
      // win内核
      case 'win32':
      case 'win64':
        return user.getWinAcc().then(winRunAcc => {
          return ['protected', 'system', 'high'].indexOf(winRunAcc) > -1
        })
      default:
        return user.getUid().then(uid => {
          return uid.toString() === '0'
        })
    }
  },
  notAdminAccTip () {
    return user.isRootAcc().then(isRootAcc => {
      // 根据系统判断
      switch (process.platform) {
        // win内核
        case 'win32':
        case 'win64':
          return log.t('sys.notAdminAccTip.win', process.argv.join(' '))
        default:
          return log.t('sys.notAdminAccTip.unix', 'sudo ' + process.argv.join(' '))
      }
    })
  },
  getWinAcc () {
    // 直接返回win7的权限结果，目前只是兼容win7以上
    return user.getWin7Acc()
  },
  getWin7Acc: require('./getWin7Acc.user.js')
}
