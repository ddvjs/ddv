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
    process.exit(0)
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
  // 输出帮助
  commander.Command.prototype.optionHelp = function () {
    var width = this.largestOptionLength()
    return [commander._pad('--help', width) + '  ' + log.t('cli.output.description.help')]
      .concat(this.options.map(function (option) {
        return commander._pad(option.flags, width) + '  ' + option.description
      }))
      .join('\n')
  }
  // 帮助信息基本例子输出
  commander.on('--help', function () {
    let p = '    '
    log.show('  Basic Examples:')
    log.show('')
    log.show(p + log.t('cli.help.examples.add_site') + ' :')
    log.show(p + '$ ddv add ./app_dir')
    log.show('')
    log.show(p + log.t('cli.help.examples.add_siteand_name') + ' :')
    log.show(p + '$ ddv add ./app_dir -n "app_name"')
    log.show('')
    log.show(p + log.t('cli.help.examples.remove_site_by_id') + ' :')
    log.show(p + '$ ddv remove [siteId]')
    log.show('')
    log.show(p + log.t('cli.help.examples.remove_site_by_name') + ' :')
    log.show(p + '$ ddv remove [app_name]')
    log.show('')
    log.show(p + log.t('cli.help.examples.start_ddv_server') + ' :')
    log.show(p + '$ ddv start')
    log.show('')
    log.show(p + log.t('cli.help.examples.restart_ddv_server') + ' :')
    log.show(p + '$ ddv restart')
    log.show('')
    log.show(p + log.t('cli.help.examples.reload_ddv_server') + ' :')
    log.show(p + '$ ddv reload')
    log.show('')
    log.show(p + log.t('cli.help.examples.stop_ddv_server') + ' :')
    log.show(p + '$ ddv stop')
    log.show('')
    log.show(p + log.t('cli.help.examples.kill_ddv_server') + ' :')
    log.show(p + '$ ddv kill')
    log.show('')
    log.show(p + log.t('cli.help.examples.update_ddv_server') + ' :')
    log.show(p + '$ npm install ddv@latest -g ; ddv update')
    log.show('')
    log.show(p + log.t('cli.help.examples.more_examples_in') + ' :')
    log.show(p + '$ ddv help add')
    log.show('')
    log.show(p + log.t('cli.help.examples.more_help') + ' :')
    log.show(p + '$ ddv help remove')
    log.show('')
    log.show(p + log.t('cli.help.examples.add_site_help') + ' :')
    log.show(p + '$ ddv help [command]')
    log.show('')
    log.show(p + log.t('cli.help.examples.remove_site_help') + ' ' + config.pkg.homepage)
    log.show('')
    log.show('')
  })
}).then(() => {
  // 引入tail模块
  require('./tail')
  // 引入server管理模块
  require('./server')
  // 引入site管理模块
  require('./site')
  // 引入other管理模块
  require('./other')
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
    process.exit(0)
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
/*
if(process.argv&&process.argv.length>1&&process.argv[2]==='telnet'){
  require(ddvPath('lib/cli/telnet'))
}else{
  require(ddvPath('lib/cli/telnet'))
}

log.error(Error('测试一个错误'))
//setTimeout(function(){console.log('33333',config)},1000)
console.log('33333',config)

  config.getConfig().then(function  (ssa) {
    console.log('ssa',ssa)
console.log('33333',config)
  }).catch((e)=>{console.log(e)})
*/
// const getConfig = require(ddvPath('lib/config'))
/* var ddvPath = require('../ddvPath')
var config = require(ddvPath('lib/config'))
console.log('ddvPath', ddvPath + 'dx')
console.log('config', config().then(function(c) {
 console.log(c)
}))
log('err ','colors.red',{'ddf':'sdfasf',"dsfaf":[2,55]},'jjj')
log.info('colors.red',{'ddf':'sdfasf',"dsfaf":[2,55]},'jjj')
log.error(Error('测试一1个错误'),new Error('测试一2个错误'))
 if (process.argv.indexOf('--no-run-daemon') > -1) {
  require('../lib/daemon/index.js')
} else {
  require('../lib/cli/index.js')
} */

