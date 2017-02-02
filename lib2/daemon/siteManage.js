'use strict'
const daemon = global.daemon || null
if (!daemon) {
  throw new Error('daemon为空')
}

// cjbbase模块
const cjbbase = daemon.lib.base
// 工具类
const b = cjbbase.inherit(cjbbase)
// 颜色控制台
const colors = daemon.lib.colors
// 日志模块
const log = daemon.lib.log
// 路径模块
const path = daemon.lib.path
// 文件模块
const fs = daemon.lib.fs
// 配置
const config = daemon.config

const siteManage = daemon.siteManage = daemon.siteManage || b.inherit(null)

siteManage.add = function add (data, callback) {
  let lists = [], q
  q = b.queue().onError(function onError (err) {
    if (callback) {
      callback(err)
    }
    callback = void 0
  }).push(function getLists (next) {
    siteManage.lists((err, l) => {
      lists.push.apply(lists, l || [])
      next()
      l = err = void 0
    })
  }, true, function addSite (next) {
    var siteIds = [], siteId = null
    b.each(lists, function (index, site) {
      if (site.path === data.path) {
        siteId = site.siteId
      }
      siteIds.push(parseInt(site.siteId) || 0)
    })
    // 排序
    siteIds.sort(function (a, b) { return b - a })
    if (siteId) {
      let err = new Error('The site of the path already exists, siteId is ' + siteId)
      err.error_id = 'SITE_ALREADY_EXISTS'
      q.error(err)
    } else {
      // 取得最后的siteId
      let i, last_siteId = ((siteIds[0] || 0) + 1) || 1
      for (i = 1; i <= last_siteId; i++) {
        if (siteIds.indexOf(i) < 0) {
          siteId = i
          break
        }
      }
      last_siteId = i = void 0
      // 插入新站点
      lists.push({
        // 站点id
        siteId: siteId,
        // 是否已经停用，每次ddv重启的时候会根据这个值来判断是否需要继续启动该站点
        isStop: false,
        // 状态
        status: 'Stoped',
        // 站点名字
        name: data.name,
        // 目录
        path: data.path,
        // 最后pid
        lastPid: 0,
        // 最后更新时间
        lastUptime: 0,
        // 最后在线时间
        lastOnlineTime: 0,
        // 重启次数
        restart: 0,
        // 错误自动重启次数
        restartByError: 0,
        // 通过 ddv-rpc-api 重启次数
        restartByCli: 0
      })
      // 排序
      lists.sort(function (a, b) {
        return (a && b && a.siteId && b.siteId && (a.siteId - b.siteId)) || 0
      })
      // 下一步
      next()
    }
    siteIds = siteId = void 0
  }, true, function saveLists (next) {
    if (callback) {
      siteManage.saveLists(lists, callback)
      callback = void 0
      lists = void 0
      q.abort()
    }
  }).run()
}
siteManage.remove = function remove (data, callback) {
  var removeLists = [], lists = [], q, removeNames = [], removeSiteIds = []
  q = b.queue().onError(function onError (err) {
    if (callback) {
      callback(err)
    }
    callback = lists = q = removeNames = removeSiteIds = removeLists = void 0
  }).push(function getLists (next) {
    siteManage.lists(function listsCb (err, l) {
      lists.push.apply(lists, l || [])
      l = err = void 0
      next()
    })
  }, true, function getRemoveSite (next) {
      // 处理参数，拆分数组
    data.siteIds = b.is.array(data.siteIds) ? data.siteId : ((data.siteIds || '').toString().split(','))
    data.names = b.is.array(data.names) ? data.names : ((data.names || '').toString().split(','))
      // 变量拆分数组
    b.each(data.siteIds, function (index, siteId) {
      if (siteId) {
        removeSiteIds[removeSiteIds.length] = parseInt(siteId || 0).toString()
      }
    })
    b.each(data.names, function (index, name) {
      if (name) {
        removeNames[removeNames.length] = (name || '').toString()
      }
    })
    if (removeSiteIds.length === 0 && removeNames.length === 0) {
      let err = Error('Names and siteIds can not be empty at the same time')
      err.error_id = 'NAMES_AND_SITE_IDS_EMPTY'
      return q && q.error(err)
    } else {
      next()
    }
  }, true, function removeSite (next) {
    let lists_t = []
    removeLists = []
    let site_t
    let is_remove = false
    while (lists.length > 0 && (site_t = lists.shift())) {
      let siteId = parseInt(site_t.siteId || 0).toString()
      let name = (site_t.name || '').toString()
      let site_index = -1
      let name_index = -1
      if ((site_index = removeSiteIds.indexOf(siteId)) > -1 || (name_index = removeNames.indexOf(name)) > -1) {
        if (site_index > -1) {
          removeSiteIds.splice(site_index, 1)
        }
        if (name_index > -1) {
          removeNames.splice(name_index, 1)
        }
        is_remove = true
        removeLists.push(site_t)
      } else {
        lists_t.push(site_t)
      }
    }
    lists = lists_t
    lists_t = void 0

    if (!is_remove) {
      let err = Error('The site was not found,\n siteIds is ' + removeSiteIds.join(',') + ' or \n site_name is ' + removeNames.join(','))
      err.error_id = 'REMOVE_SITE_NOT_FOUND'
      q.error(err)
    } else {
      next()
    }
  }, true, function saveLists (next) {
    siteManage.saveLists(lists, function saveListsCb () {
      if (callback && b.is.function(callback)) {
        callback(null, removeLists)
      }
      callback = lists = q = removeNames = removeSiteIds = removeLists = void 0
    })
    lists = undefined
    q.abort()
  }).run()
    // 运行队列
}
// 保存列表
siteManage.saveLists = function saveLists (data, callback) {
  try {
    b.each(data, function (index, site) {
      site.lastUptime = b.now()
    })
  } catch (err) {
  }
  try {
    fs.writeFile(config.DDV_SITE_FILE, b.toJSON(data), {
      encoding: 'utf8',
      mode: '0777',
      flag: 'w'
    }, callback)
  } catch (err) {
    callback(err)
  }
}
// 读取列表
siteManage.lists = function lists (callback) {
  // 判断是否存在
  fs.stat(config.DDV_SITE_FILE, (err, stat) => {
    if (err || (!stat.isFile())) {
      return callback && callback(null, [])
    } else {
      let ctime = stat.ctime.getTime()
      // 读取列表
      fs.readFile(config.DDV_SITE_FILE, {
        encoding: 'utf8'
      }, function readFileCb (err, data) {
        if (err) {
          data = []
        } else {
          try {
            data = b.parseJSON(data)
          } catch (e) {
            data = []
          }
          b.each(data, function (index, site) {
            site.fileMtime = ctime
            index = site = void 0
          })
        }
        callback(null, data)
        err = data = ctime = void 0
      })
    }
    err = stat = void 0
  })
}
