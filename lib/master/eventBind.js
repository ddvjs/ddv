'use strict'
// 定义进程标题
process.title = 'ddvServerMaster'
// 路径模块
const ddvPath = require('../ddvPath')
// jsnet模块-主线程管理模块
const master = require('ddv-worker')
// 日志模块
const log = require(ddvPath('lib/log'))
const path = require('path')
const workerWhich = require('./which.js')

master.on('error', function masterError (e) {
  log.error('master.error')
  log.error(e)
})
master.on('server::listening', function masterError (info) {
  log.info('master.server.listen.ing', info)
})
master.on('server::close', function masterError (info) {
  log.info('master.server.listen.close', info)
})
master.on('server::error', function masterError (e) {
  if (e.code === 'EACCES' && e.message.indexOf('listen EACCES') > -1) {
    log.error('master.server.eacces')
  } else {
    log.error('master.server.error')
  }
  log.error(e)
  process.exit(1)
})
// 主进程启动完毕
master.on('loadend', function masterInit () {
  // 服务器启动
  master.serverRun()
  // 重新载入站点
  master.reLoadSite()
})

master.onDaemonCall('getSiteInfoOne', function processInfoCb ({siteId}) {
  return master.getWidsBySiteId(siteId).then(wids => {
    var getChildren = []
    Array.isArray(wids) && wids.forEach(wid => {
      getChildren.push(
        master.callWorker(wid, 'getProcessInfo').then(({data}) => {
          // 名字
          data.name = 'w:' + wid
          // 状态
          data.status = data.status || 'Stoped'
          // 是否错误
          data.isError = false
          return data
        }, ({name, type, stack}) => {
          let data = {
            // 错误名字
            errorName: name,
            // 错误类型
            errorType: type,
            // 错误栈
            errorStack: stack,
            // 进程内存
            memory: '0',
            // 状态
            status: 'ErrorMast',
            // 是否错误
            isError: true
          }
          return data
        })
      )
    })
    return Promise.all(getChildren).then(children => ({data: {children}}))
  })
})

// 重启站点
master.reLoadSite = function reLoadSite (callback) {
  return master.getSiteLists({timeout: 1000 * 50}).then(lists => {
    // 添加网站到服务，通过列表数据添加
    Array.isArray(lists) && lists.forEach(site => {
      master.loadSite(site)
    })
  }).catch(e => master.emit('server::error', e))
}
// 获取站点列表
master.getSiteLists = function getSiteLists ({timeout}) {
  var timer
  // 调用守护进程获取站点列表
  return Promise.race([
    new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        var e = new master.MasterError('get the site list timeout')
        e.type = 'getSiteLists'
        e.name = 'GET_SITE_LISTS_ERROR'
        reject(e)
        timer = void 0
      }, (timeout || 1000 * 50))
    }),
    master.callDaemon('getSiteLists', {}).then(({data}) => {
      Array.isArray(data) && data.forEach(site => {
        site.logOutput = site.logOutput || path.join(site.path, 'log/output.log')
        site.logError = site.logError || path.join(site.path, 'log/error.log')
        site.logAll = site.logAll || path.join(site.path, 'log/all.log')
        try {
          let workerParse = workerWhich(site.path)
          site.workerFile = site.workerFile || workerParse.file
          site.workerArgs = site.workerArgs || workerParse.args
          site.workerOptions = site.workerOptions || workerParse.options
          site.isError = false
        } catch (e) {
          site.isError = true
          // site.e = e
          console.log(site, e)
          return
        }
      })
      return data
    }).then(lists => {
      timer && clearTimeout(timer)
      return lists
    })
  ])
}
