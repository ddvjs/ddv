'use strict'
// ddv日志模块
const ddvPath = require('../../ddvPath')
// 日志模块
const log = require(ddvPath('lib/log'))
// commander 模块
const commander = require('commander')
// 监听ddv系统模块
const cmdTailDdv = require('./ddv')
// 监听站点模块
const cmdTailSite = require('./site')

/**
 * 监听文件末尾变化
 */
commander
.command('tail [site_name] [error|log|all]')
.description(log.t('cli.help.command.tail'))
.action(function (tailSiteName, logType) {
  if (!logType && tailSiteName && ['all', 'log', 'err', 'error'].indexOf(tailSiteName) > -1) {
    logType = tailSiteName
    tailSiteName = void 0
  }
  logType = logType || 'all'
  if (['all', 'log', 'err', 'error'].indexOf(logType) < 0) {
    // 输出帮助
    log.error('cli.command.tail.not_supported').then(() => {
      commander.parse([commander.argvSource[0], commander.argvSource[1], 'tail', '--help'])
    })
  }
  tailSiteName ? cmdTailSite(tailSiteName, logType) : cmdTailDdv(logType)
  tailSiteName = logType = void 0
})
