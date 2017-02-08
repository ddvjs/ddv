'use strict'
const ddvPath = require('../../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
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
  c.__api(true, 'kill', {
    'pid': c.pid
  }, function callback (e, res) {
    if (e) {
      console.log('kill-结果失败', e)
    } else {
      let [colAligns, head, Table, table, t] = [[], [], require('cli-table2')]
      // 实例
      b.each(res, function (index, pidt) {
        t = []
        b.each(pidt, function (name, value) {
          if (!table) {
            head[head.length] = name
            colAligns[colAligns.length] = 'center'
          }
          t.push(value)
        })
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
      console.log('kill-结果成功')
      if (table) {
        console.log(table.toString())
      }
      table = head = colAligns = undefined
    }
  })
})

/**
 * 监听文件末尾变化
 */
commander
.command('guid [setGuid]')
.description(log.t('cli.help.command.guid.set'))
.action(function (setGuid) {
  c.__api('guid', {set_guid: (setGuid === void 0 ? null : setGuid)}, (err, res) => {
    let logkey = 'CLI_COMMAND_GUID_' + (setGuid ? 'SET_' : 'GET_')
      // 加入成功失败
    logkey += err ? 'FAIL' : 'SUCCESS'
      // 提示结果
    log.tip((err ? 'ERR ' : ' OK '), logkey)
    if (err) {
      console.error(colors.grey(err.message))
      console.error('')
    } else {
      log.tip((err ? 'ERR ' : ' OK '), ['CLI_COMMAND_GUID_TIP', res.guid])
    }
    c.__disconnect()
    logkey = void 0
  })
})
