'use strict'
const ddvPath = require('../../ddvPath')
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
// tool
const tool = require(ddvPath('lib/cli/rpc/tool'))
// cli-rpc
const rpc = require(ddvPath('lib/cli/rpc/rpc'))

/**
 * 添加站点
 */
commander
.command('add <file|path>')
.option('-n, --name <name>', 'set a <name> for site')
.description(log.t('cli.help.command.add.name'))
.action(function (path) {
  rpc('add', tool._cmdGetPathName(path, commander.name)).then(res => {
    log.tip('FAIL', 'cli.command.add.stie.success')
    // 显示列表
    commander.rpcSiteLists()
  }).catch(e => {
    log.tip('FAIL', 'cli.command.add.stie.fail')
    log.error(e)
  })
  path = void 0
})

/**
 * 开启服务进程
 */
commander
.command('start [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', '')
.description(log.t('cli.help.command.start.site'))
.action(function start () { commander.rpcBySiteIdName('start') })
/**
 * 重启服务进程
 */
commander
.command('restart [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', '')
.description('Restart ddv server or restart site')
.description(log.t('cli.help.command.restart.site'))
.action(function restart () { commander.rpcBySiteIdName('restart') })
/**
 * 停止服务进程
 */
commander
.command('stop [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', '')
.description(log.t('cli.help.command.stop.site'))
.action(function stop () { commander.rpcBySiteIdName('stop') })
/**
 * 移除
 */
commander
.command('remove [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2', '')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', -1)
.description(log.t('cli.help.command.remove.main'))
.action(function remove () { commander.rpcBySiteIdName('remove') })
/**
 * 移除 remove的别名
 */
commander
.command('delete [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', '')
.description(log.t('cli.help.command.remove.alias'))
.action(function remove () { commander.rpcBySiteIdName('remove') })
/**
 * 移除 remove的别名
 */
commander
.command('del [name|siteId]')
.option('-n, --name <names>', '<names> eg: -n app1,app2')
.option('-i, --siteId <siteIds>', '<siteIds> eg: -s 1,2', '')
.description(log.t('cli.help.command.remove.alias'))
.action(function remove () { commander.rpcBySiteIdName('remove') })
/**
 * 列出站点和当前的站点状态
 */
commander
.command('lists')
.description(log.t('cli.help.command.lists.main'))
.action(function () {
  commander.rpcSiteLists()
})
commander
.command('list')
.description(log.t('cli.help.command.lists.alias'))
.action(function () {
  commander.rpcSiteLists()
})

commander
.command('ls')
.description(log.t('cli.help.command.lists.alias'))
.action(function () {
  commander.rpcSiteLists()
})

commander
.command('l')
.description(log.t('cli.help.command.lists.alias'))
.action(function () {
  commander.rpcSiteLists()
})

commander
.command('status')
.description(log.t('cli.help.command.lists.alias'))
.action(function () {
  commander.rpcSiteLists()
})
// 返回的JSON
commander
.command('jlist')
.description(log.t('cli.help.command.lists.json'))
.action(function () {
  commander.rpcSiteLists(true)
})
// 返回格式化好的JSON
commander
.command('prettylist')
.description(log.t('cli.help.command.lists.json_prettified'))
 .action(function () {
   commander.rpcSiteLists(true, true)
 })
