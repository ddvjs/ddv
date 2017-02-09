'use strict'
const debug = require('debug')('ddv/site/manage')
// ddv路径模块
const ddvPath = require('../ddvPath')
// 获取配置信息
const config = require(ddvPath('lib/config'))
// 文件模块
const fs = require('fs')
// 工具模块
const util = require('ddv-worker/util')
// 导出管理模块
const manage = module.exports = {
  add (data) {
    debug('add data:', data)
    return manage.lists().catch(err => {
      debug('manage lists error:', err)
      return []
    }).then(lists => {
      debug('get siteId')
      var siteId, siteIds, r
      siteIds = []
      lists.forEach(site => {
        // 判断是否存在过这个站点
        if (site.path === data.path) {
          siteId = site.siteId
        }
        // 加入数组
        siteIds.push(parseInt(site.siteId) || 0)
      })
      if (siteId) {
        let err = new Error('The site of the path already exists, siteId is ' + siteId)
        err.error_id = 'SITE_ALREADY_EXISTS'
        debug('Error', err)
        r = Promise.reject(err)
      } else {
        // 排序
        siteIds.sort(function (a, b) { return b - a })
        // 取得最后的siteId
        let i
        let lastSiteId = ((siteIds[0] || 0) + 1) || 1
        for (i = 1; i <= lastSiteId; i++) {
          if (siteIds.indexOf(i) < 0) {
            siteId = i
            break
          }
        }
        lastSiteId = i = void 0
        r = [lists, siteId]
      }
      siteId = siteIds = void 0
      return r
    }).then(([lists, siteId]) => {
      debug('add site to manage lists')
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
      // 排序站点列表
      lists.sort(function (a, b) {
        return (a && b && a.siteId && b.siteId && (a.siteId - b.siteId)) || 0
      })
      return lists
    }).then(lists => {
      return manage.saveLists(lists)
    })
  },
  remove (data) {
    return manage.lists().then(lists => {
      debug('lists', lists)
      let r
      let siteIds = data && (data.siteIds || data.siteId || data.siteids) || ''
      let names = data && (data.names || data.name) || ''
      debug('siteIds', siteIds)
      debug('names', names)
      // 变量拆分数组
      let siteIdArray = siteIds.toString().split(',')
      let nameArray = names.toString().split(',')
      debug('siteIdArray', siteIdArray)
      debug('nameArray', nameArray)
      // 定义移除数组
      let removeNames = []
      let removeSiteIds = []
      // 变量加入移除
      nameArray.forEach(name => name && removeNames.push((name || '').toString()))
      siteIdArray.forEach(siteId => siteId && removeSiteIds.push(parseInt(siteId || 0).toString()))
      debug('removeNames', removeNames)
      debug('removeSiteIds', removeSiteIds)
      // 如果没有要移除的
      if (removeSiteIds.length === 0 && removeNames.length === 0) {
        let err = new Error('Names and siteIds can not be empty at the same time')
        err.error_id = 'NAMES_AND_SITE_IDS_EMPTY'
        r = Promise.reject(err)
        err = void 0
      } else {
        r = [lists, removeSiteIds, removeNames]
      }
      lists = siteIds = names = siteIdArray = nameArray = removeNames = removeSiteIds = void 0
      return r
    }).then(([lists, removeSiteIds, removeNames]) => {
      var isRemove = false
      var newLists = []
      var removeLists = []
      var r
      lists.forEach(site => {
        var siteId = parseInt(site.siteId || 0).toString()
        var name = (site.name || '').toString()
        var siteIndex = -1
        var nameIndex = -1
        if ((siteIndex = removeSiteIds.indexOf(siteId)) > -1 || (nameIndex = removeNames.indexOf(name)) > -1) {
          if (siteIndex > -1) {
            removeSiteIds.splice(siteIndex, 1)
          }
          if (nameIndex > -1) {
            removeNames.splice(nameIndex, 1)
          }
          isRemove = true
          removeLists.push(site)
        } else {
          newLists.push(site)
        }
      })
      if (isRemove) {
        r = [newLists, removeLists]
        debug('newLists', newLists)
        debug('removeLists', removeLists)
      } else {
        let err = Error('The site was not found,\n siteIds is ' + removeSiteIds.join(',') + ' or \n site_name is ' + removeNames.join(','))
        err.error_id = 'REMOVE_SITE_NOT_FOUND'
        debug('err', err)
        r = Promise.reject(err)
        err = void 0
      }
      isRemove = newLists = removeLists = void 0
      return r
    }).then(([lists, removeLists]) => {
      manage.saveLists(lists).then(() => {
        return removeLists
      })
      lists = void 0
    })
  },
  // 保存列表
  saveLists (lists) {
    debug('saveLists', lists)
    Array.isArray(lists) || (lists = [])
    lists.forEach(site => {
      site && (site.lastUptime = util.now())
    })
    return new Promise((resolve, reject) => {
      fs.writeFile(config.DDV_SITE_FILE, JSON.stringify(lists), {
        encoding: 'utf8',
        mode: '0777',
        flag: 'w'
      }, e => {
        e ? reject() : resolve()
      })
      lists = void 0
    })
  },
  // 读取列表
  lists () {
    debug('lists')
    return config.getConfig().then(() => {
      return new Promise((resolve, reject) => {
        // 判断是否存在
        fs.stat(config.DDV_SITE_FILE, (err, stat) => {
          if (err) {
            debug('lists stat', err)
            reject(err)
          } else {
            if (stat.isFile()) {
              resolve(stat.ctime)
            } else {
              reject(new Error('Not a valid configuration file'))
            }
          }
          err = stat = void 0
        })
      })
    }).then(ctime => {
      return new Promise((resolve, reject) => {
        debug('lists readFile')
        // 读取列表
        fs.readFile(config.DDV_SITE_FILE, {
          encoding: 'utf8'
        }, (err, data) => {
          if (err) {
            debug('lists readFile err', err)
            reject(err)
          } else {
            let ctimeStr = ctime.getTime()
            let lists = JSON.parse(data)
            lists.forEach(site => {
              site && (site.fileMtime = ctimeStr)
            })
            debug('lists resolve', lists)
            resolve(lists)
            lists = ctimeStr = void 0
          }
          err = data = ctime = void 0
        })
      })
    }).catch(e => {
      debug('lists catch', e)
      return []
    })
  }
}
