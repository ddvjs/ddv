'use strict'
const childProcess = require('child_process')
const isUuidRegex = /^[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}$/
const uuidRegex = /[\da-fA-F]{8}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{4}-[\da-fA-F]{12}/
const getServerGuid = module.exports = function getServerGuid (cmdPrefix) {
  return new Promise((resolve, reject) => {
    if (process.env.SERVER_GUID && getServerGuid.isServerGuid(process.env.SERVER_GUID)) {
      resolve(process.env.SERVER_GUID)
      return
    }
    var cmd, args, delimiter, uuid, error
    cmdPrefix = cmdPrefix || ''
    // 参数
    args = ['UUID', 'Serial']
    // 分隔符
    delimiter = ': '
    switch (process.platform) {
      // windows 系统
      case 'win32':
      case 'win64':
        // 分隔符
        delimiter = '\r\n'
        // 参数
        args[1] = 'IdentifyingNumber'
        // 命令
        cmd = 'wmic CsProduct Get '
        // 结束
        break
      // mac os 系统
      case 'darwin':
        // 命令
        cmd = 'system_profiler SPHardwareDataType | grep '
        break
      // linux 系统
      case 'linux':
        // cpu架构
        if (process.arch === 'arm') {
          // arm的命令
          cmd = 'cat /proc/cpuinfo | grep '
        } else {
          // 其他的命令
          cmd = 'dmidecode -t system | grep '
        }
        break
      // freebsd 系统
      case 'freebsd':
        // 其他的命令
        cmd = 'dmidecode -t system | grep '
        break
    }
    // 通过cmd获取
    if (cmd) {
      try {
        let res = childProcess.execSync(cmdPrefix + cmd + args[0])
        res = getServerGuid.parseResult(res ? res.toString().toLowerCase() : '', delimiter)
        let t
        if (res && res.length > 0 && (t = uuidRegex.exec(res))) {
          uuid = t[0]
        }
      } catch (e) {
        error = e
      }
      if (!(uuid && getServerGuid.isServerGuid(uuid || ''))) {
        try {
          let res = childProcess.execSync(cmdPrefix + cmd + args[1])
          res = getServerGuid.parseResult(res ? res.toString().toLowerCase() : '', delimiter)
          if (res && res.length > 0) {
            let t
            if (res && res.length > 0 && (t = uuidRegex.exec(res))) {
              uuid = t[0]
            } else {
              let i, rid, ridNew
              res = res.replace(/\s+/g, '')
              // 种子
              rid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
              ridNew = ''
              for (i = rid.length - 1; i >= 0; i--) {
                let ridT = rid[i]
                if (ridT === 'x') {
                  let ridLen = res.length
                  while (ridLen > 0 && (ridT = res.charAt(ridLen - 1)).replace(/[\da-f]/g, '') !== '') {
                    res = res.substr(0, ridLen - 1)
                    if (ridT.replace(/[g-z]/g, '') === '') {
                      let ridNum = parseInt(ridT, 36)
                      while (ridNum > 0) {
                        if (ridNum > 16) {
                          res += 'f'
                          ridNum -= 16
                        } else {
                          res += ridNum.toString(16)
                          ridNum = -1
                        }
                      }
                    }
                    ridLen = res.length
                  }
                  ridT = res ? res.charAt(ridLen - 1) : 'x'
                  res = res.substr(0, ridLen - 1)
                }
                ridNew = ridT + ridNew
              }
              // 补充剩下部分
              uuid = ridNew.replace(/[xy]/g, '0')
            }
          }
        } catch (e) {}
      }
      if (!(uuid && getServerGuid.isServerGuid(uuid))) {
        switch (process.platform) {
          // mac os 系统
          case 'darwin':
            try {
              let res = childProcess.execSync(cmdPrefix + 'ioreg -rd1 -c IOPlatformExpertDevice')
              res = getServerGuid.parseResult(res ? res.toString().toLowerCase() : '', delimiter)

              let t
              if (res && res.length > 0 && (t = uuidRegex.exec(res))) {
                uuid = t[0]
              }
            } catch (e) {
              error = e
            }
            break
        }
      }
    }
    if (uuid && getServerGuid.isServerGuid(uuid)) {
      resolve(uuid)
    } else {
      error = error || new Error('Cannot provide serial number for ' + process.platform)
      reject(error)
    }
  })
}
Object.assign(getServerGuid, {
  parseResult (input, delimiter) {
    return input.slice(input.indexOf(delimiter) + 2).trim()
  },
  // 判断是否为guid
  isServerGuid (uuid) {
    return isUuidRegex.test(uuid)
  }
})

