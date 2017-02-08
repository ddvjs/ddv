
// ddv 地址模块
const colors = require('colors')
const path = require('path')
// 日志模块
const tool = module.exports = {
  bytesToSize (bytes, precision) {
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
  },
  timeSince (date) {
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
  },

  _cmdListsColors  (site) {
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
  },
  // 通过路径获取name
  _cmdGetPathName (_path, name) {
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
}
tool
