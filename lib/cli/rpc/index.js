'use strict'
// 调试模块模块
const debug = require('debug')('ddv/cli/rpc/index')
// ddv 地址模块
const ddvPath = require('../../ddvPath')
// 获取配置信息
const table = require(ddvPath('lib/cli/table'))
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
// 工具
const util = require('ddv-worker/util')
// rpc
const rpc = require('./rpc')
// tool
const tool = require('./tool')

// log.show('开发中')
// console.log(config)
Object.assign(commander, {
  rpcSiteLists (isEchoJson, isPrettifiedJson) {
    return rpc(true, 'lists', { 'is_status': true }).then((res) => {
      debug('rpcSiteLists--res:', res)
      if (isEchoJson) {
        return log.tip(' OK ', 'cli.command.lists.echoJson', JSON.stringify(res, null, (isPrettifiedJson ? 2 : null)))
      }
      log.t('cli.command.lists.head')
      var statusLists = ['ErrorTrys', 'ErrorMast', 'ErrorConf', 'Stoped', 'Runing', 'Restarting', 'Listening']
      var o = {
        head: [],
        keys: [ 'name', 'siteId', 'pid', 'status', 'restart', 'lastUptime', 'memory', 'ws', 'http', 'socket', 'debug' ],
        fns: [ null, null, null, null, null, function lastUptime (value) {
          return tool.timeSince(value || 0)
        }, function memory (value) {
          return tool.bytesToSize((value || 0), 3)
        }, null, null, null, null ],
        colAligns: [ 'left', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center' ]
      }
      log.t('cli.command.lists.head').forEach((v, i) => {
        o.head.push(log.t('cli.command.lists.head.' + i))
      })
      var lists = []
      util.each(res, function (siteId, site) {
        if (site.children && site.children.length === 1) {
          delete site.children[0].name
          util.extend(true, site, site.children[0])
          delete site.children
        }
        if (site.children && site.children.length > 0) {
          site.status = 'Listening'
          site.memory = 0
          site.ws = 0
          site.http = 0
          site.socket = 0
          util.each(site.children, function (index, child) {
            child.name = child.name || 'worker'
            child.name = ((site.children.length === index + 1) ? ' └─ ' : ' ├─ ') + child.name
            // 最后更新时间
            child.lastUptime = site.lastUptime
            site.memory += (parseInt(child.memory) || 0)
            site.ws += (parseInt(child.ws) || 0)
            site.http += (parseInt(child.http) || 0)
            site.socket += (parseInt(child.socket) || 0)
            // 状态取大原则
            site.status = statusLists.indexOf(child.status) < statusLists.indexOf(site.status) ? child.status : site.status
          })
          // 插入标题
          tool._cmdListsColors(site)
          lists.push(site)
          // 遍历插入
          util.each(site.children, function (index, child) {
            // 插入分支
            tool._cmdListsColors(child)
            lists.push(child)
          })
        } else {
          tool._cmdListsColors(site)
          lists.push(site)
        }

        siteId = site = undefined
      })
      console.log(table.lists(o, lists))
    }).then(res => {

    }).catch((e) => {
      // 提示获取失败
      log.tip('FAIL', 'cli.command.lists.fail')
      // 详细错误
      log.error(e)
    })
  },
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
    return rpc(type, args).then(res => {
      log.tip(' OK ', `cli.command.${type.toLowerCase()}.${isServer ? 'server' : 'stie'}.success`)
      isServer = type = void 0
      return commander.rpcSiteLists()
    }).catch(err => {
      log.tip(' ERR ', `cli.command.${type.toLowerCase()}.${isServer ? 'server' : 'stie'}.fail`)
      isServer = type = void 0
      log.error(err)
      rpc.disconnect()
    })
  }

})
