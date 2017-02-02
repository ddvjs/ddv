/**
 * [log(type, msg, pid, wid)]
 * @author: 桦 <yuchonghua@163.com>
 * @DateTime 2016-09-03T14:28:55+0800
 * @return   {[type]}                 [description]
 */
'use strict'
// 引入模块
const colors = require('colors/safe')
const path = require('path')
const util = require('util')
// cjbbase模块
const cjbbase = require('cjb-base')
var langs
const log = function () {
  return log.show.apply(log, arguments)
}
log._process_type = ''
log.DEBUG = false
log.LOCALE = 'EN'
log.langsFile = 'daemon.ddv.js'
log.tip = function () {
  if (!langs) {
    try {
      langs = require('../language' + path.sep + log.LOCALE + path.sep + log.langsFile)(colors)
    } catch (e) {
      langs = require('../language' + path.sep + 'EN' + path.sep + log.langsFile)(colors)
    }
  }
  var args, msg, msgText, pid, dtype, type, msgS
  args = arguments
  pid = args[2] ? args[2] : process.pid
  type = cjbbase.trim(args[0]) || 'INFO'
  switch (type) {
    case 'INFO':
      type = 'cyan'
      break
    case 'OK':
      type = 'green'
      break
    case 'WARN':
      type = 'yellow'
      break
    case 'ERR':
    case 'FAIL':
      type = 'red'
      break
    default:
      type = 'grey'
      break
  }

  msgText = args[1]
  if (cjbbase.type(msgText, 'array')) {
    msgS = msgText.slice(1)
    msgText = msgText[0]
  }
  msgText = langs[msgText] || msgText || 'unknown msg'
  if (msgS) {
    msgText += msgS.join('')
  }
  msg = ''
  dtype = 'white'
  msg += colors[dtype]('[')
  msg += colors[type].bold(args[0])
  msg += colors[dtype](']')
  msg += colors[dtype]('[')
    // 输出类型
  if (log._process_type) {
    msg += colors[type](log._process_type + ':')
  }
  msg += colors[type]('PID:' + pid)
  msg += colors[dtype](']')
  msg += colors[dtype]('  ')
  msg += colors[dtype](msgText)
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
log.show = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(msg)
}
log.prompt = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(colors.grey(msg))
}
log.info = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(colors.green(msg))
}
log.input = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(colors.grey(msg))
}
log.help = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(colors.cyan(msg))
}
log.warn = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.log(colors.yellow(msg))
}
log.debug = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  if (log.DEBUG !== true) {
    return
  }
  console.log(colors.blue(msg))
}
log.error = function (...args) {
  let len = args.length
  let i
  for (i = 0; i < len; i++) {
    log.errorOne(args[i])
  }
}
log.errorOne = function varDumpError (e) {
  if (!(cjbbase.type(e, 'error') || (e.stack && e.name))) {
    e = new Error(cjbbase.type(e, 'string') ? e : 'Unknown Error')
  }
  e.name = e.name || 'unknown_error'
  e.type = e.type || 'unknown_error'
  e.message = e.message || 'Unknown Error'
  if (!e.stack) {
    e.stack = (new Error(e.message)).stack
  }
  //
  try {
    let stack = ''
    stack += '\n\n    ***********stdio error out stack***********\n\n'
    stack += (new Error('stdio error out stack')).stack.split('\n').slice(1).join('\n')
    e.stack += stack
  } catch (e) {}
  log.tip('ERR ', e.message)
  console.error(colors.cyan('==============错误开始=============='))
  log.__error('[Type:' + e.name + ']')
  log.__error(e.stack + '\n')
  for (let key in e) {
    if (key === 'msg' && e[key] === e.message) {
      continue
    }
    switch (key) {
      case 'constructor':
      case 'stack':
        continue
    }
    log.__error(key + ':', e[key])
  }
  console.error(colors.cyan('==============错误结束=============='))
}
log.__error = function (...args) {
  let msg = `${util.format.apply(null, args)}`
  console.error(colors.red(msg))
}
log.redinfo = function (msg) {
  if (typeof msg === 'object') {
    console.log(colors.red('消息'), msg)
  } else {
    console.log(colors.red(msg))
  }
}
log.setLangs = function (l) {
  langs = l
}
module.exports = log
