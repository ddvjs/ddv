'use strict'
// 标题
process.title = 'ddvCli'
if (process.argv.indexOf('-s') > -1 || process.argv.indexOf('--silent') > -1 || process.env.SILENT) {
  for (var key in console) {
    var code = key.charCodeAt(0)
    if (code >= 97 && code <= 122) {
      console[key] = function () {}
    }
  }
}
const ddvPath = require('../ddvPath')
// commander 模块
const commander = require('commander')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 日志模块
const log = require(ddvPath('lib/log'))

log._processType = 'CLI'
log.i18nInit().then(() => {
  return new Promise(function (resolve, reject) {
    if (process.argv && process.argv.length > 1 && process.argv[2] === 'telnet') {
      require('./telnet')
      return
    } else {
      resolve()
    }
  })
}).then(() => {
  // 设定版本号
  commander._version = config.version
  // 获取版本
  commander.option('-v, --version', log.t('cli.output.description.version'))
  // 版本号事件
  commander.on('version', () => {
    process.stdout.write(commander._version + '\n')
    process.exit(config.SUCCESS_EXIT)
  })
}).then(() => {
  // 使用格式
  commander.usage('[command]')
  // 站点名字
  commander.option('-n, --name <name>', log.t('cli.output.description.site_name'), null)
  // 站点id
  commander.option('-i, --siteId <siteId>', log.t('cli.output.description.site_id'), null)
  // 不启动后台进程
  commander.option('--no-run-daemon', log.t('cli.output.description.no_run_daemon'), false)
  // 隐藏输出内容
  commander.option('-s, --silent', log.t('cli.output.description.silent'), false)
}).then(() => {
  // 引入rpc模块
  require('./rpc')
  // 引入site管理模块
  require('./siteManage')
  // 引入server管理模块
  require('./serverManage')
  // 引入tail模块
  require('./tail')
}).then(() => {
  // 输出帮助
  commander.Command.prototype.optionHelp = function () {
    var width = this.largestOptionLength()
    return [commander._pad('--help', width) + '  ' + log.t('cli.output.description.help')]
      .concat(this.options.map(function (option) {
        return commander._pad(option.flags, width) + '  ' + option.description
      }))
      .join('\n')
  }
  /**
   * 详细帮助
   */
  commander
  .command('help')
  .description(log.t('cli.command.help'))
  .action(function (command) {
    if (arguments.length === 1) {
      commander.outputHelp()
    } else {
      commander.parse([commander.argvSource[0], commander.argvSource[1], command, '--help'])
    }
  })
  /**
   * 其他
   */
  commander
  .command('*')
  .action(function () {
    log.error('cli.command.not_found', 'ddv ' + commander.argvSource.slice(2).join(' ')).then(() => {
      commander.outputHelp()
      process.exit(config.ERROR_EXIT)
    })
  })

  // 帮助信息基本例子输出
  commander.on('--help', function () {
    let p = '    '
    log.show('  Basic Examples:')
    log.show('')
    log.show(p + log.t('cli.help.command.add.site') + ' :')
    log.show(p + '$ ddv add ./app_dir')
    log.show('')
    log.show(p + log.t('cli.help.command.add.name') + ' :')
    log.show(p + '$ ddv add ./app_dir -n "app_name"')
    log.show('')
    log.show(p + log.t('cli.help.command.remove.site_by_id') + ' :')
    log.show(p + '$ ddv remove [siteId]')
    log.show('')
    log.show(p + log.t('cli.help.command.remove.site_by_name') + ' :')
    log.show(p + '$ ddv remove [app_name]')
    log.show('')
    log.show(p + log.t('cli.help.command.start.server') + ' :')
    log.show(p + '$ ddv start')
    log.show('')
    log.show(p + log.t('cli.help.command.restart.server') + ' :')
    log.show(p + '$ ddv restart')
    log.show('')
    log.show(p + log.t('cli.help.command.reload.server') + ' :')
    log.show(p + '$ ddv reload')
    log.show('')
    log.show(p + log.t('cli.help.command.stop.server') + ' :')
    log.show(p + '$ ddv stop')
    log.show('')
    log.show(p + log.t('cli.help.command.kill') + ' :')
    log.show(p + '$ ddv kill')
    log.show('')
    log.show(p + log.t('cli.help.command.update') + ' :')
    log.show(p + '$ npm install ddv@latest -g ; ddv update')
    log.show('')
    log.show(p + log.t('cli.help.command.add.site_help') + ' :')
    log.show(p + '$ ddv help add')
    log.show('')
    log.show(p + log.t('cli.help.command.remove.site_help') + ' :')
    log.show(p + '$ ddv help remove')
    log.show('')
    log.show(p + log.t('cli.help.command.more.help') + ' :')
    log.show(p + '$ ddv help [command]')
    log.show('')
    log.show(p + log.t('cli.help.command.more.examples_in') + ' ' + config.pkg.homepage)
    log.show('')
    log.show('')
  })
}).then(() => {
  var argv = process.argv
  if (
    argv[argv.length - 1] === 'help' &&
    argv.length > 1) {
    argv.length = argv.length - 1
    argv.push('--help')
  }
  if (
    argv[argv.length - 1] === '/?' &&
    argv.length > 1) {
    argv.length = argv.length - 1
    argv.push('--help')
  }
  commander.argvSource = argv
  if (!argv || argv.length <= 2) {
    argv = argv.slice(0, 2)
    // 解析命令行输入
    commander.parse(argv)
    // 输出帮助
    commander.outputHelp()
    // 不带错误码退出
    process.exit(config.SUCCESS_EXIT)
  } else {
    // 直接解析
    commander.parse(argv)
  }
}).catch((e) => {
  log.error(e)
})
commander._pad = function pad (str, width) {
  var len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}
