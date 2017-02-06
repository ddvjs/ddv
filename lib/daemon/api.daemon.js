'use strict'
// ddv路径模块
const getDaemon = require('./getDaemon')
// ddv路径模块
const ddvPath = require('../ddvPath')
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

  daemon.getSiteInfoByLists = function (lists, callback) {
    var q
    q = b.queue()
    b.each(lists, function siteOne (siteId, site) {
      site.name = site.name || site.path
      site.siteId = site.siteId || siteId
      site.children = []
      if (site.siteId !== '-') {
        q.push(function getSiteInfoOne (next) {
          daemon.callMaster('getSiteInfoOne', {
            siteId: this.siteId
          }, (state, message, handle) => {
            if (state) {
              if (message && message.children && Array.isArray(message.children)) {
                let [i, len] = [0, message.children.length || 0]
                for (; i < len; i++) {
                  let children = message.children[i]
                  if (!children) continue
                  // 站点id
                  children.siteId = (children.siteId === void 0) ? children.siteId : this.siteId
                  // 状态
                  children.status = children.status || this.status || 'Stoped'
                  // 最后更新时间
                  children.lastUptime = b.is.number(children.lastUptime) ? children.lastUptime : (this.lastUptime || b.now())
                  // 调试
                  children.debug = children.debug || 'Unknow'
                  // 内存
                  children.memory = children && children.memoryUsage && children.memoryUsage.heapTotal || '0'
                  this.children.push(children)
                  children = undefined
                }
                this.restart = message.restart || 0
              }
            } else {
              this.error_stack = message
              this.restart = this.restart || 0
            }
              // 错误状态
            this.isError = state
            next()
              // 回收
            next = state = message = handle = void 0
          })
        }.bind(site))
      }
      site = siteId = void 0
    })
    q.push(true, function end () {
      if (callback && util.isFunction(callback)) {
        callback()
      }
      callback = undefined
    })
    lists = undefined
      // 运行队列
    q.run()
  }
}
