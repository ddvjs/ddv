'use strict'
const startup = {}
// 子进程模块
const childProcess = require('child_process')
// path模块
const path = require('path')
// 颜色模块
const colors = require('colors/safe')
// fs模块
const fs = require('fs')
// 执行模块
const execSync = childProcess.execSync
// 日志模块
var log
var username

startup.run = function (config) {
  if (!log) {
    log = arguments[1]
  }
  if (!username) {
    username = arguments[2]
  }
  switch (config.platform) {
    // win内核
    case 'win32':
    case 'win64':
      log.tip('INFO', 'CLI_STARTUP_THIS_OS_IS_WIN')
      return startup.startupTryWin32Run(config)
    default:
      log.tip('INFO', 'CLI_STARTUP_THIS_OS_IS_UNIX')
      return startup.startupTryUnixRun(config)
  }
}

startup.startupTryWin32Run = function (config) {
  console.log('暂时不支持win的后台服务，正在努力开发中...')

  return true
}
startup.startupTryUnixRun = function (config) {
  var scriptFile, script, platform
  // 运行脚本文件
  scriptFile = '/etc/init.d/ddv-init.sh'
  // 脚本
  script = config.UBUNTU_STARTUP_SCRIPT

  platform = config.platform

    // 红帽使用centos模式
  if (platform === 'redhat') {
    platform = 'centos'
  } else if (platform === 'systemd') {
    scriptFile = '/etc/systemd/system/ddv.service'
  } else if (platform === 'darwin') {
    scriptFile = path.join((process.env.HOME || config.homePath), 'Library/LaunchAgents/so.cjb.ddv.plist')
    if (!fs.existsSync(path.dirname(scriptFile))) {
      fs.mkdirSync(path.dirname(scriptFile))
    }
  } else if (platform === 'freebsd') {
    scriptFile = '/etc/rc.d/ddv'
  }

  // 如果是这个系统
  if (~['freebsd', 'systemd', 'centos', 'amazon', 'gentoo', 'darwin'].indexOf(platform)) {
    script = config[platform.toUpperCase() + '_STARTUP_SCRIPT']
  }

  // 读取脚本内容
  script = fs.readFileSync(script, {encoding: 'utf8'})

  // 替换环境变量
  script = script
      // 运行的文件
      .replace(/%DDV_PATH%/g, config.ddvMainFile)
      // 配置文件
      .replace(/%DDV_CONFIG_PATH%/g, config.ddvConfigPath)
      // ddv运行配置
      .replace(/%DDV_HOME_PATH%/g, config.ddvHomePath)
      // home_path环境变量
      .replace(/%HOME_PATH%/g, config.homePath)
      // execPath环境变量
      .replace(/%NODE_PATH%/g, config.execPath)
      // 正常输出日志
      .replace(/%DDV_OUT_LOG_FILE_PATH%/g, config.DDV_OUT_LOG_FILE_PATH)
      // 异常输出日志
      .replace(/%DDV_ERR_LOG_FILE_PATH%/g, config.DDV_ERR_LOG_FILE_PATH)
      // 默认用户
      .replace(/%USER%/g, (username || 'root'))

  // 提示
  log.tip('INFO', ['CLI_STARTUP_GENERATING_SYSTEM_IN', colors.green(scriptFile)])

  // 尝试写入启动文件
  try {
    fs.writeFileSync(scriptFile, script)
  } catch (e) {
    log.tip('ERR ', ['CLI_STARTUP_GENERATING_SYSTEM_ERROR', colors.red(e.message || 'unknown error')])
    log.tip.error(e)
    process.exit(1)
  }

  // 判断是否写入成功
  if (!fs.existsSync(scriptFile)) {
    log.tip('ERR ', ['CLI_STARTUP_PROBLEM_TRY_WRITE_ERROR', colors.red(scriptFile)])
    log.tip.show('\n' + colors.yellow(script))
    // 中断返回 错误
    process.exit(1)
  }

  log.tip('INFO', 'CLI_STARTUP_MAKING_BOOTING_AT_STARTUP')

  var cmd = ''

  switch (platform) {
    case 'systemd':
      cmd = [
        'systemctl daemon-reload',
        'systemctl enable ddv',
        'systemctl start ddv'
      ].join(' && ')
      break
    case 'centos':
    case 'amazon':
      cmd = 'chmod +x ' + scriptFile + '; chkconfig --add ' + path.basename(scriptFile)
      fs.closeSync(fs.openSync('/var/lock/subsys/ddv-init.sh', 'w'))
      log.tip('INFO', ['CLI_STARTUP_LOCKFILE_HAS_BEEN_ADDED', colors.green('/var/lock/subsys/ddv-init.sh')])
      break
    case 'gentoo':
      cmd = 'chmod +x ' + scriptFile + '; rc-update add ' + path.basename(scriptFile) + ' default'
      break
    case 'darwin':
      cmd = ''
      break
    case 'freebsd':
      cmd = 'chmod +x ' + scriptFile
      break
    default :
      cmd = 'chmod +x ' + scriptFile + ' && update-rc.d ' + path.basename(scriptFile) + ' defaults'
      break
  }

  cmd = cmd ? [cmd] : []
  cmd.unshift.apply(cmd, [
    'chmod -R 755 ' + JSON.stringify(config.dir.bin),
    'chmod -R 755 ' + JSON.stringify(config.dir.lib),
    'chmod -R 777 ' + JSON.stringify(config.ddvHomePath)
  ])
  cmd = cmd.join(' && ')

  if (platform === 'systemd' || platform === 'freebsd') {
    cmd = 'su root -c "' + cmd + '"'
  } else if (platform !== 'darwin') {
    cmd = 'su -c "' + cmd + '"'
  }

  log.tip('INFO', ['CLI_STARTUP_USING_THE_COMMAND', '-' + platform + '-'])
  log.show('      ' + colors.grey(cmd))

  try {
    let stdo = execSync(cmd)
    log.show(stdo.toString().replace(/[\r\n]$/, ''))
    log.tip('INFO', 'CLI_STARTUP_DONE')
    config.isStartupInit = true
    // 保存配置
    config.save()
    // 重新载入配置
    config.reload(true)
    // 返回成功
    return true
  } catch (err) {
    log.tip('ERR ', ['CLI_STARTUP_RUN_CMD_ERROR', err])
    log.tip('ERR ', 'CLI_STARTUP_USE_RIGHT_PLATFORM')
    log.show(err.stderr && err.stderr.toString().replace(/[\r\n]$/, ''))
    process.exit(1)
  }
}

module.exports.run = function startupRun () {
  return startup.run.apply(startup, arguments)
}
