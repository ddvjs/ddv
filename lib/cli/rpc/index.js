'use strict'
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')

// log.show('开发中')
// console.log(config)
Object.assign(commander, {
  // 通过siteId或者站点名字操作
  cmdBySiteIdName (type) {
    var args = Object.create(null)
    args.siteIds = []
    args.name = []
    if (b.is.number(c.args && c.args[0])) {
      args.siteIds.push(c.args[0])
    } else if (b.is.string(c.args && c.args[0])) {
      args.name.push(c.args[0])
    }
    b.each((c.siteId || '').split(','), function (index, t) {
      if (t) {
        b.each((t || '').split('|'), function (index, siteId) {
          if (siteId) {
            args.siteIds.push(siteId)
          }
        })
      }
    })
    b.each((c.name || '').split(','), function (index, t) {
      if (t) {
        b.each((t || '').split('|'), function (index, name) {
          if (name) {
            args.name.push(name)
          }
        })
      }
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
          log.tip('ERR ', 'CLI_COMMAND_ARGUMENTS_NOT_EMPTY')
          c.parse([c.argv_source[0], c.argv_source[1], type, '--help'])
          args = type = void 0
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
