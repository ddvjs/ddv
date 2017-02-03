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

// log.show('开发中')
// console.log(config)
Object.assign(commander, {
  // 通过siteId或者站点名字操作
  rpcBySiteIdName (type) {
    var args = Object.create(null)
    args.siteIds = []
    args.name = []
    if (util.isNumber(commander.args && commander.args[0])) {
      args.siteIds.push(commander.args[0])
    } else if (commander.args && util.type(commander.args[0], 'string')) {
      args.name.push(commander.args[0])
    }
    // 遍历siteId
    util.type(commander.siteId, 'string') && commander.siteId.split(',').forEach((t) => {
      t && (t || '').split('|').forEach((siteId) => siteId && args.siteIds.push(siteId))
    })
    // 遍历name
    util.type(commander.name, 'string') && commander.name.split(',').forEach((t) => {
      t && (t || '').split('|').forEach((index, name) => name && args.name.push(name))
    })

    args.siteIds = args.siteIds.join(',')
    args.name = args.name.join(',')
    let isServer = !(args.siteIds || args.name)
    if (isServer) {
      switch (type || '') {
        case 'start':
        case 'restart':
        case 'reload':
        case 'stop':
          break
        default:
          log.error('cli.command.arguments_not_empty').then(() => {
            commander.parse([commander.argv_source[0], commander.argv_source[1], type, '--help'])
            args = type = void 0
          })
          return
      }
    }

    c.__api(type, args, (err, res) => {
      let logkey = 'CLI_COMMAND_' + type.toUpperCase()
      // 加入服务器或者站点
      logkey += isServer ? '_SERVER_' : '_STIE_'
      // 加入成功失败
      logkey += err ? 'FAIL' : 'SUCCESS'
      // 提示结果
      log.tip((err ? 'ERR ' : ' OK '), logkey)
      if (err) {
        console.error(colors.grey(err.message))
        console.error('')
        c.__disconnect()
      } else {
      // 显示列表
        c._cmdLists()
      }
      logkey = isServer = type = void 0
    })
    args = void 0
  }

})
