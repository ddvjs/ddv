/**
 * [log(type, pid, msg)]
 * @author: 桦 <yuchonghua@163.com>
 * @DateTime 2016-09-03T14:28:55+0800
 * @return   {[type]}                 [description]
 */
'use strict'
// 引入模块
const ddvPath = require('../ddvPath')
const chalk = require('chalk')
const I18n = require('i18n-cli')
const util = require('ddv-worker/util')
const nodeUtil = require('util')
const config = require(ddvPath('lib/config'))
const log = module.exports = function logTip () {
  return log.tip.apply(log, arguments)
}
log.defaultColor = 'white'
log.defaultLocale = 'en_US'
log.i18nPromise = function (path, locale, defaultLocale) {
  return log.i18nPromiseRun(path, locale).catch((e) => {
    if (e.code === 'MODULE_NOT_FOUND' && e.message.indexOf(locale) > -1) {
      return log.i18nPromiseRun(locale, defaultLocale)
    } else {
      throw e
    }
  })
}
log.i18nPromiseRun = function (path, locale) {
  return new Promise(function (resolve, reject) {
    try {
      resolve(new I18n({
        path: path,
        locale: locale
      }))
    } catch (e) {
      reject(e)
    }
  })
}
log.i18nInit = function () {
  return Promise.resolve()
  .then(() => {
    if (!config.locale) {
      return config.getConfig().catch(() => {
        return config.getOsLocale().then((locale) => {
          config.locale = locale || log.defaultLocale
        })
      })
    }
  }).then(() => {
    if (!log.i18n) {
      return log.i18nPromise(ddvPath('lib/locales'), config.locale, log.defaultLocale).then((i18n) => {
        log.i18n = i18n
      })
    }
  })
}
log.tip = function logTip () {
  var args = util.argsToArray(arguments)
  if (config.locale && log.i18n) {
    // 同步
    try {
      // 试图直接提示
      log._tipRun(args)
      // 返回成功
      return Promise.resolve()
    } catch (e) {
      // 显示失败
      console.log(e)
      // 返回成功
      return Promise.resolve()
    }
  } else {
    // 初始化
    return log.i18nInit()
    .then(() => {
      // 试图输出提示
      log._tipRun(args)
    }).catch(function (e) { console.log(e) })
  }
}
log._tipRun = function _tipRun (args) {
  var msgArgs, msgArgsTemp
  msgArgs = args.splice(util.isNumber(args[1]) ? 2 : 1)
  msgArgs = util.isArray(msgArgs) ? msgArgs : []
  msgArgsTemp = []
  msgArgs.forEach((value) => {
    msgArgsTemp.push(nodeUtil.format(value))
  })
  msgArgs = msgArgsTemp
  msgArgsTemp = void 0
  var msg = log.i18n.t.apply(log.i18n, msgArgs)
  var pid, type, colorType, open, close
  if (util.isArray(args)) {
    type = args[0]
    pid = args[1]
  } else if (util.isNumber(args)) {
    pid = args
  } else if (!args) {
    type = args
  }
  pid = util.isNumber(pid) ? pid : process.pid
  type = ((type || '').toString() || 'INFO').toUpperCase()
  switch (type.trim()) {
    case 'INFO':
    case 'HELP':
      colorType = 'cyan'
      break
    case 'RES':
    case 'OK':
      colorType = 'green'
      break
    case 'WARN':
      colorType = 'yellow'
      break
    case 'ERR':
    case 'FAIL':
      colorType = 'red'
      break
    case 'DEBUG':
      colorType = 'blue'
      break
    case 'PROMPT':
    case 'INPUT':
    default:
      colorType = 'grey'
      break
  }
  colorType = colorType || log.defaultColor
  open = chalk[log.defaultColor]('[')
  close = chalk[log.defaultColor](']')

  msg = [
    open,
    chalk[colorType].bold(type),
    close,
    open,
    log._processType ? chalk[colorType].bold(log._processType + ':') : '',
    chalk[colorType].bold('PID:' + pid),
    close,
    ' ',
    msg
  ].join('')
  args = pid = colorType = open = close = void 0

  switch (type) {
    case 'WARN':
    case 'ERR':
    case 'FAIL':
      console.error(msg)
      break
    default:
      console.log(msg)
      break
  }
}
log.t = function () {
  return log.i18n.t.apply(log.i18n, arguments)
}
log.show = function () {
  return console.log.apply(console, arguments)
}
// 提示
log.prompt = function (...args) {
  args.unshift('prompt')
  return log.tip.apply(log, args)
}
// 信息
log.info = function (...args) {
  args.unshift('info')
  return log.tip.apply(log, args)
}
log.input = function (...args) {
  args.unshift('input')
  return log.tip.apply(log, args)
}
log.help = function (...args) {
  args.unshift('help')
  return log.tip.apply(log, args)
}
log.warn = function (...args) {
  args.unshift('warn')
  return log.tip.apply(log, args)
}
log.debug = function (...args) {
  if (log.DEBUG !== true) {
    return Promise.resolve()
  }
  args.unshift('debug')
  return log.tip.apply(log, args)
}
log.error = function varDumpError (...args) {
  var e = args[0]
  if (['string', 'number'].indexOf(util.type(e)) > -1) {
    args[0] = args[0] || 'error.unknown'
    args.unshift('err')
    return log.tip.apply(log, args)
  }
  if (args && args.length > 1) {
    let r = []
    let len = args.length
    let i
    for (i = 0; i < len; i++) {
      r.push(log.error(args[i]))
    }
    return Promise.all(r)
  }
  if (e instanceof Error || e instanceof Object) {
    e.name = e.name || e.type || 'unknown_error'
    e.type = e.type || e.name || 'unknown_error'
    e.message = e.message || 'Unknown Error'
    if (!e.stack) {
      e.stack = (new Error(e.message)).stack
    }
    //
    try {
      e.stack += '\n\n    ***********stdio error out stack***********\n\n' +
      (new Error('stdio error out stack')).stack.split('\n').slice(1).join('\n')
    } catch (e) {}
    var objmsg = []
    for (let key in e) {
      if (key === 'msg' && e[key] === e.message) {
        continue
      }
      switch (key) {
        case 'constructor':
        case 'stack':
          continue
      }
      objmsg.push(key + ':' + nodeUtil.format(e[key]))
    }
    return log.tip('err ', 'error.stack', e.message, objmsg.join('\n'), e.stack)
  } else {
    return log.tip('err', 'error.unknown')
  }
}
process.nextTick(function () {
  process.nextTick(() => {
    config.getConfig().catch((e) => {
      // 容错
    })
  })
})
