'use strict'
// ddv路径模块
const getDaemon = require('./getDaemon')
// 工具模块
const util = require('ddv-worker/util')
module.exports = function eventBind () {
  return getDaemon().then(daemon => {
    // 绑定关闭事件
    apiInit(daemon)
  })
}
function apiInit (daemon) {
  daemon._getsiteIdsNames = function (data) {
    var t = {
      names: [],
      siteIds: []
    }
    if (data.siteIds) {
      if (!Array.isArray(data.siteIds)) {
        data.siteIds = data.siteIds.toString().split(',')
      }
      data.siteIds.forEach(siteId => siteId && t.siteIds.push(siteId))
    }
    if (data.names) {
      if (!Array.isArray(data.names)) {
        data.names = data.names.toString().split(',')
      }
      data.names.forEach(name => name && t.names.push(name))
    }
    data = undefined
    return t
  }
  daemon.stopRun = function (data, callback) {
    var t = daemon._getsiteIdsNames(data)
    if (t.siteIds.length > 0 || t.names.length > 0) {
      console.log('停止siteIds', t)
    } else {
      daemon.stop(callback)
    }
  }
  daemon.startRun = function (data, callback) {
    var t = daemon._getsiteIdsNames(data)
    if (t.siteIds.length > 0 || t.names.length > 0) {
      console.log('startRunsiteIds', t)
    } else {
      daemon.start(callback)
    }
  }
  daemon.restartRun = function (data, callback) {
    var t = daemon._getsiteIdsNames(data)
    if (t.siteIds.length > 0 || t.names.length > 0) {
      console.log('restartRunsiteIds', t)
    } else {
      daemon.restart(callback)
    }
  }

  daemon.getSiteInfoByLists = function (lists) {
    var getSites = []
    Array.isArray(lists) && lists.forEach((site, index) => {
      site.name = site.name || site.path
      site.siteId = site.siteId || index
      site.children = []
      if (site.siteId !== '-') {
        site.restart = site.restart || 0
        getSites.push(
          daemon.callMaster('getSiteInfoOne', {
            siteId: site.siteId
          }).then(({data}) => {
            site.isError = false
            data && data.children && Array.isArray(data.children) && data.children.forEach(t => {
              if (!t) return
              // 站点id
              t.siteId = (t.siteId === void 0) ? t.siteId : site.siteId
              // 状态
              t.status = t.status || site.status || 'Stoped'
              // 最后更新时间
              t.lastUptime = util.isNumber(t.lastUptime) ? t.lastUptime : (site.lastUptime || util.now())
              // 调试
              t.debug = t.debug || 'Unknow'
              // 内存
              t.memory = t && t.memoryUsage && t.memoryUsage.heapTotal || '0'
              site.children.push(t)
              t = void 0
            })
            site = void 0
          }, ({name, type, stack}) => {
            site.isError = true
            site.errorName = name
            site.errorType = type
            site.errorStack = stack
            site = void 0
          })
        )
      }
      index = void 0
    })
    return Promise.all(getSites).then(() => {
      return lists
    })
  }
}
