'use strict'
const debug = require('debug')('ddv/sys/getWin7Acc.user')
// 子进程模块
const childProcess = require('child_process')
// 导出模块
module.exports = function getWin7Acc () {
  return new Promise((resolve, reject) => {
    // 尝试判断是否拥有 protected 权限
    childProcess.exec('whoami /groups | findstr /b /c:"Mandatory Label\\Protected Process Mandatory Level"', (error, stdout, stderr) => {
      if (error) {
        reject(error)
        debug(`getWin7Acc exec error: ${error}`)
        return
      } else {
        debug(`getWin7Acc - stdout: ${stdout}`)
        debug(`getWin7Acc - stderr: ${stderr}`)
        resolve('protected')
      }
    })
  }).catch(e => {
    return new Promise((resolve, reject) => {
      // 尝试判断是否拥有 system 权限
      childProcess.exec('whoami /groups | findstr /b /c:"Mandatory Label\\System Mandatory Level"', (error, stdout, stderr) => {
        if (error) {
          reject(error)
          debug(`getWin7Acc exec error: ${error}`)
          return
        } else {
          debug(`getWin7Acc - stdout: ${stdout}`)
          debug(`getWin7Acc - stderr: ${stderr}`)
          resolve('system')
        }
      })
    })
  }).catch(e => {
    return new Promise((resolve, reject) => {
      // 尝试判断是否拥有 high 权限
      childProcess.exec('whoami /groups | findstr /b /c:"Mandatory Label\\High Mandatory Level"', (error, stdout, stderr) => {
        if (error) {
          reject(error)
          debug(`getWin7Acc exec error: ${error}`)
          return
        } else {
          debug(`getWin7Acc - stdout: ${stdout}`)
          debug(`getWin7Acc - stderr: ${stderr}`)
          resolve('high')
        }
      })
    })
  }).catch(e => {
    return new Promise((resolve, reject) => {
      // 尝试判断是否拥有 explorer 权限
      childProcess.exec('whoami /groups | findstr /b /c:"Mandatory Label\\Medium Mandatory Level"', (error, stdout, stderr) => {
        if (error) {
          reject(error)
          debug(`getWin7Acc exec error: ${error}`)
          return
        } else {
          debug(`getWin7Acc - stdout: ${stdout}`)
          debug(`getWin7Acc - stderr: ${stderr}`)
          resolve('explorer')
        }
      })
    })
  }).catch(e => {
    return new Promise((resolve, reject) => {
      // 尝试判断是否拥有 explorer 权限
      childProcess.exec('whoami /groups | findstr /b /c:"Mandatory Label\\Low Mandatory Level"', (error, stdout, stderr) => {
        if (error) {
          reject(error)
          debug(`getWin7Acc exec error: ${error}`)
          return
        } else {
          debug(`getWin7Acc - stdout: ${stdout}`)
          debug(`getWin7Acc - stderr: ${stderr}`)
          resolve('ie')
        }
      })
    })
  }).catch(e => {
    return 'guest'
  })
}
