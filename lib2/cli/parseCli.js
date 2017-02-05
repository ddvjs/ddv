'use strict'
var startDaemon, log
// 配置参数
const config = require('../config/index.js')
// commander 模块
const c = require('commander')
// path 模块
const path = require('path')
// colors 模块
const colors = require('colors')
// Api模块
const Api = require('../api/index.js')
// cjbbase模块
const b = require('cjb-base')
// 解析命令
const parseCli = module.exports = function parseCli (argv) {
  c.argv_source = argv
  if ((!argv) || argv.length <= 2) {
    argv = argv || process.argv.slice(0, 2)
    // 解析命令行输入
    c.parse(argv)
    // 输出帮助
    c.outputHelp()
    // 退出
    process.exit(1)
  } else {
    c.parse(argv)
  }
}
// 设置
parseCli.setStartDaemon = function (fn) {
  startDaemon = fn
}
// 设置
parseCli.setLog = function (l) {
  log = l
}

// 获取语言包数据
const langs = (((locale) => {
  locale = locale || 'EN'
  let langs
  try {
    langs = require('../language' + path.sep + locale + path.sep + 'parseCli.ddv.js')(colors)
  } catch (e) {
    langs = require('../language' + path.sep + 'EN' + path.sep + 'parseCli.ddv.js')(colors)
  }
  return langs
})(config.locale))

// 通过路径获取name
c._cmdGetPathName = function (_path, name) {
  const r = Object.create(null)
  // r.siteId = b.is.number(_path)?parseInt(_path):-1;
  // 转为绝对路径
  _path = path.resolve(_path, '.')
  if (!name) {
    // 如果没有传入名称，使用路径末尾的名字
    name = path.basename(_path)
    if (path.extname(name) === '.js') {
      name = path.basename(path.dirname(_path))
    }
  }
  r.path = _path
  r.name = name
  return r
}
// 显示列表
c._cmdLists = function _cmdLists (isEchoJson, isPrettifiedJson) {
  c.__api(true, 'lists', {
    'is_status': true
  }, function callback (e, res) {
    if (e) {
      // 提示获取失败
      log.tip('FAIL', 'CLI_COMMAND_GET_STIE_LISTS_FAIL')
      console.error(colors.red(e.message))
      console.error('')
      console.error(e)
    } else {
      if (isEchoJson) {
        console.log(colors.yellow(JSON.stringify(res, null, (isPrettifiedJson ? 2 : null))))
      } else {
        let Table = require('cli-table2')
        let statusLists = ['ErrorTrys', 'ErrorMast', 'ErrorConf', 'Stoped', 'Runing', 'Restarting', 'Listening']
        // 实例
        let table = new Table({
          head: ['Site name', 'id', 'pid', 'status', 'restart', 'uptime', 'memory', 'ws', 'http', 'sk', 'debug' ],
          colAligns: ['left', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center', 'center'],
          style: {'padding-left': 1, head: ['cyan', 'bold'], compact: true}
        })
        b.each(res, function (siteId, site) {
          if (site.children && site.children.length === 1) {
            delete site.children[0].name
            b.extend(true, site, site.children[0])
            delete site.children
          }
          if (site.children && site.children.length > 0) {
            site.status = 'Listening'
            site.memory = 0
            site.ws = 0
            site.http = 0
            site.socket = 0
            b.each(site.children, function (index, child) {
              child.name = child.name || 'worker'
              child.name = ((site.children.length == index + 1) ? ' └─ ' : ' ├─ ') + child.name
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
            tool._cmdListsTablePush(table, site)
            // 遍历插入
            b.each(site.children, function (index, child) {
              // 插入分支
              tool._cmdListsTablePush(table, child)
            })
          } else {
            tool._cmdListsTablePush(table, site)
          }

          siteId = site = undefined
        })
        console.log(table.toString())
        table = undefined
      }
      isEchoJson = isPrettifiedJson = res = undefined
    }
  })
}

const tool = Object.create(null)
tool._cmdListsTablePush = (table, site) => {
  tool._cmdListsColors(site)
  let info = []
  // Site name
  info.push(site.name)
  // id
  info.push((site.siteId == void 0) ? '-' : site.siteId)
  // pid
  info.push((site.pid == void 0) ? '-' : site.pid)
  // status restart uptime
  info.push((site.status || 'Unknow'), (site.restart || 0), tool.timeSince(site.lastUptime || 0))
  // memory ws http socket
  info.push(tool.bytesToSize((site.memory || 0), 3), site.ws, site.http, site.socket)
  info.push(site.debug)
  table.push(info)
}
tool._cmdListsColors = (site) => {
  switch (site.status) {
    // 监听中-绿色
    case 'Listening':
      site.status = colors.green.bold(site.status)
      site.name = colors.cyan.bold(site.name)
      break
    // 启动中-黄色
    case 'Restarting':
    case 'Runing':
      site.status = colors.yellow.bold(site.status)
      site.name = colors.cyan.bold(site.name)
      break
    // 已经停止的-红色
    case 'Stoped':
    case 'ErrorConf':
    case 'ErrorMast':
    case 'ErrorTrys':
      site.status = colors.red.bold(site.status)
      site.name = colors.red.bold(site.name)
      break
    // 其他-粉色
    default :
      site.status = colors.magenta.bold(site.status)
      site.name = colors.magenta.bold(site.name)
      break
  }
  site.debug = colors[((site.debug === 'Enabled') ? 'green' : 'grey')](site.debug)
}

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */

tool.pad = function pad (str, width) {
  var len = Math.max(0, width - str.length)
  return str + Array(len + 1).join(' ')
}

tool.bytesToSize = function (bytes, precision) {
  var kilobyte = 1024
  var megabyte = kilobyte * 1024
  var gigabyte = megabyte * 1024
  var terabyte = gigabyte * 1024

  if ((bytes >= 0) && (bytes < kilobyte)) {
    return bytes + 'B'
  } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
    return (bytes / kilobyte).toFixed(precision) + 'KB'
  } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
    return (bytes / megabyte).toFixed(precision) + 'MB'
  } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
    return (bytes / gigabyte).toFixed(precision) + 'GB'
  } else if (bytes >= terabyte) {
    return (bytes / terabyte).toFixed(precision) + 'TB'
  } else {
    return bytes + 'B'
  }
}
tool.timeSince = function timeSince (date) {
  var seconds = Math.floor((new Date() - date) / 1000)
  var interval = Math.floor(seconds / 31536000)

  if (interval > 1) {
    return interval + 'Y'
  }
  interval = Math.floor(seconds / 2592000)
  if (interval > 1) {
    return interval + 'M'
  }
  interval = Math.floor(seconds / 86400)
  if (interval > 1) {
    return interval + 'D'
  }
  interval = Math.floor(seconds / 3600)
  if (interval > 1) {
    return interval + 'h'
  }
  interval = Math.floor(seconds / 60)
  if (interval > 1) {
    return interval + 'm'
  }
  return Math.floor(seconds) + 's'
}

}
