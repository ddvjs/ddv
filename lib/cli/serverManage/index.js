'use strict'
const ddvPath = require('../../ddvPath')
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
// cli-rpc
const rpc = require(ddvPath('lib/cli/rpc/rpc'))
/**
 * 开启服务进程
 */
commander
.command('start')
.description(log.t('cli.help.command.start.server'))
.action(function start () { commander.rpcBySiteIdName('start') })
/**
* 重启服务进程
*/
commander
.command('restart')
.description('Restart ddv server or restart site')
.description(log.t('cli.help.command.restart.server'))
.action(function restart () { commander.rpcBySiteIdName('restart') })
/**
* 重启服务进程
*/
commander
.command('reload')
.description(log.t('cli.help.command.reload.server'))
.action(function reload () { commander.rpcBySiteIdName('reload') })
/**
* 停止服务进程
*/
commander
.command('stop')
.description(log.t('cli.help.command.stop.server'))
.action(function stop () { commander.rpcBySiteIdName('stop') })
/**
* 重启后
*/
commander
.command('resurrect')
.description(log.t('cli.help.command.resurrect'))
.action(function () {
  console.log('重启了')
})
/**
 * 杀掉守护进程
 */
commander
.command('kill')
.option('-p --pid <pid>', 'kill pid')
.description(log.t('cli.help.command.kill'))
.action(function () {
  rpc(true, 'kill', {
    'pid': commander.pid
  }).then(res => {
    let [colAligns, head, Table, table, t] = [[], [], require('cli-table2')]
    // 实例
    if (Array.isArray(res)) {
      res.forEach(pidt => {
        t = []
        for (let name in pidt) {
          let value = pidt[name]
          if (!table) {
            head[head.length] = name
            colAligns[colAligns.length] = 'center'
          }
          t.push(value)
        }
        if (!table) {
          table = new Table({
            head: head,
            colAligns: colAligns,
            style: {'padding-left': 1, head: ['cyan', 'bold'], compact: true}
          })
          head = colAligns = undefined
        }
        table.push(t)
        t = undefined
      })
      if (table) {
        console.log(table.toString())
      }
      table = head = colAligns = undefined
    } else {
      log.tip('RES ', res)
    }
    console.log('kill-结果成功')
  }).catch(e => {
    log.error(e)
  })
})

/**
 * 监听文件末尾变化
 */
commander
.command('guid [setGuid]')
.description(log.t('cli.help.command.guid.set'))
.action(function (setGuid) {
  rpc(true, 'guid', {set_guid: (setGuid === void 0 ? null : setGuid)}).then(res => {
    log.tip(' OK ', `cli.command.guid.${(setGuid ? 'set' : 'get')}.success`)
    log.tip('RES ', 'cli.command.guid.res', res.guid)
  }).catch(e => {
    log.tip(' ERR ', `cli.command.guid.${(setGuid ? 'set' : 'get')}.fail`)
    log.error(e)
  })
})
