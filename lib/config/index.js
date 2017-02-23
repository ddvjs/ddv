'use strict'
// 内部方法
const fn = Object.create(null)
// 配置
const config = module.exports = Object.create(fn)
// 路径模块
const ddvPath = require('../ddvPath')
// 参数编码模块
const buildParams = require(ddvPath('lib/config/buildParams'))
// 服务器guid模块
const serverGuid = require(ddvPath('lib/config/serverGuid'))
// 基本常量
const constants = require(ddvPath('lib/config/constants'))
// 工具类
const util = require('ddv-worker/util')
// 获取语言环境库
const osLocale = require('os-locale')
// 编码库-fs内置
const fs = require('fs')
// 编码库-node内置
const crypto = require('crypto')
// 递归创建目录
const mkdirp = require('mkdirp')
const callbacks = []
const functionStr = typeof function () {}
// 包前缀
fn.pkgPrefix = 'npm_package_config_'
// 保存时排斥前缀
fn.continueKeys = 'dir configSign pkg cwd arch platformByNode platform execPath homePath ddvMainFile ddvConfigFile ddvConfigPath'.split(' ')
fn.envKeys = 'cwd arch platformByNode platform execPath homePath ddvMainFile ddvConfigFile ddvConfigPath'.split(' ')
// 强制重新获取
fn.isReload = false
// 是否真正获取
fn.isGetConfigIng = false
// 是否读取过一次配置信息
fn.isReadConfigOne = false
// 获取配置信息
fn.getConfig = function getConfigPromise (opt) {
  var r = new Promise(function (resolve, reject) {
    callbacks.push([resolve, reject])
    process.nextTick(() => {
      if (callbacks.length < 1) {
        return
      }
      if (fn.isGetConfigIng !== true) {
        fn.getConfig()
      }
    })
    resolve = reject = void 0
  })
  if (fn.isGetConfigIng === true) {
    return r
  }
  fn.isGetConfigIng = true
  fn.getConfigRun(opt).then((res) => {
    var cb
    while ((cb = callbacks.shift())) {
      if (cb && cb[0] && typeof cb[0] === functionStr) {
        cb[0](res)
      }
    }
    cb = void 0
    fn.isGetConfigIng = false
  }).catch((e) => {
    var cb
    while ((cb = callbacks.shift())) {
      if (cb && cb[1] && typeof cb[1] === functionStr) {
        cb[1](e)
      }
    }
    cb = void 0
    fn.isGetConfigIng = false
  })
  return r
}
// 获取配置信息-马上运行
fn.getConfigRun = function getConfigRunPromise (opt) {
  return new Promise(function (resolve, reject) {
    if (!opt) {
      opt = Object.create(null)
      opt.pkgPrefix = process.env.DDV_GET_CONFIG_PKG_PREFIX
    }
    resolve()
  // 并发队列
  }).then(() => {
    return Promise.all([
      Promise.resolve().then(function () {
        // package的config前缀
        config.pkgPrefix = opt && opt.pkgPrefix || config.pkgPrefix
      }),
      // 获取配置包配置
      fn.getPackage(),
      // 获取基本信息
      Promise.resolve().then(function getBaseInfo () {
        // 工作目录
        fn.cwd = process.cwd()
        // cpu架构
        fn.arch = process.arch
        // 运行的环境目录
        fn.execPath = (process.platform !== 'darwin' ? ddvPath.dirname(process.execPath) : (process.env.NODE_PATH || process.env.PATH)) || config.execPath
        // 获取 用户home目录
        fn.homePath = process.env.HOME_PATH || process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE || config.homePath
        fn.homePath = ddvPath.resolve(config.homePath, '.')
        // ddv入口文件
        fn.ddvMainFile = process.env.DDV_MAIN_FILE || process.mainModule && process.mainModule.filename || config.ddvMainFile
        // 试图从环境变量中获取配置文件目录
        fn.ddvConfigPath = process.env.DDV_CONFIG_PATH || config.ddvConfigPath
      }),
      new Promise(function (resolve, reject) {
        // 系统内核
        fn.platformByNode = process.platform
        // 判断系统环境
        switch (fn.platformByNode) {
          case 'win32':
            fn.platform = config.platformByNode
            break
          // case 'win32':
          // case 'win64':
          // case 'darwin':
          default:
            fn.platform = config.platformByNode
            break
        }
        resolve()
      })
    ])
  })
  // 获取home路径
  .then(() => {
    return fn.getHomePath().then((p) => {
      fn.homePath = p
    })
  })
  // 获取ddvConfig路径
  .then(() => {
    return fn.getDdvConfigPath().then((p) => {
      fn.ddvConfigPath = p
    })
  })
  // 读取缓存文件
  .then(() => {
    return fn.readConfigFile().then(() => {
      if (config.isReload === false) {
        if (config.version !== config.pkg.version) {
          // 由于系统版本更新，尝试重新载入所有配置信息
          config.isReload = true
          // 覆盖新版本
          fn.version = config.pkg.version || '0.0.0'
        }
      }
    })
  })
  // 并发队列
  .then(() => {
    var r = []
    // 强制重载语言环境
    config.locale && !config.isReload || r.push(fn.getOsLocale())
    // 服务器guid
    config.serverGuid && !config.isReload || r.push(fn.getServerGuid())
    // 常量
    r.push(constants(config).then((cst) => {
      // 排除cst的数据
      Array.prototype.push.apply(fn.continueKeys, Object.keys(cst))
      // 注入常量数据到config中
      util.extend.call(fn, true, fn, cst)
    }))
    return Promise.all(r)
  })
  // 返回配置
  .then(() => {
    // 清理强制刷新标识
    delete config.isReload
    // 保存配置信息到文件
    return fn.saveConfigFile()
  })
  // 返回配置
  .then(() => {
    return fn.getSaveConfig(config).then(c => {
      var keys = c && typeof c === typeof {} && Object.keys(c || {}) || []
      keys = (Array.isArray(keys) ? keys : []).concat(fn.envKeys)
      return keys
    }).then(keys => {
      return fn.ddvWorkerEnv(config, keys, 'DDV_WORKER_')
    }).then(() => {
      process.env.DDV_WORKER_SERVER_GUID = process.env.SERVER_GUID = config.serverGuid
    })
  })
  .then(function () {
    // 返回配置对象
    return config
  })
}
fn.ddvWorkerEnv = function ddvWorkerEnv (data, keys, envPrefix) {
  var promises = []
  Array.isArray(keys) && data && keys.forEach(key => {
    if (!(key && data[key])) return
    var value = data[key]
    key = envPrefix + key.toString().replace(/([A-Z])/g, '_$1').toUpperCase()
    switch (util.type(value) || '') {
      case 'number':
      case 'string':
        process.env[key] = value
        break
      case 'boolean':
        process.env[key] = value ? 'true' : 'false'
        break
      case 'array':
      case 'object':
        promises.push(fn.ddvWorkerEnv(value, Object.keys(value), (key + '_')))
        break
    }
  })
  return Promise.all(promises)
}
// 读取配置文件
fn.readConfigFile = function readConfigFile () {
  if (config.isReload === false && fn.isReadConfigOne === true) {
    // 直接返回过滤的结果
    return fn.getSaveConfig(config)
  }
  return new Promise((resolve, reject) => {
    if (!config.ddvConfigPath) {
      resolve(config)
      return
    }
    fn.ddvConfigFile = config.ddvConfigFile || ddvPath.resolve(config.ddvConfigPath, 'config.json')
    resolve(config.ddvConfigFile)
  }).then((ddvConfigFile) => {
    return new Promise((resolve, reject) => {
      var isExists = true
      fs.stat(ddvConfigFile, (err, stats) => {
        if (err) {
          resolve([false, ddvConfigFile])
          return
        }
        isExists = isExists && stats.isFile()
        resolve([isExists, ddvConfigFile])
      })
    })
  }).then(([isExists, ddvConfigFile]) => {
    var tempConfig
    if (isExists) {
      try {
        tempConfig = require(ddvConfigFile)
      } catch (e) {}
    }
    return (tempConfig || Object.create(null))
  }).then((c) => {
    return Promise.all([fn.getSaveConfig(c), fn.getConfigSign(c)])
  }).then(([c, sign]) => {
    fn.configSign = sign
    util.extend.call(config, true, config, c)
    fn.isReadConfigOne = true
    return c
  })
}
// 保存配置文件
fn.saveConfigFile = function saveConfigFile () {
  // 获取配置信息
  return fn.getSaveConfig(config).then((c) => {
    // 并发请求
    return Promise.all([fn.getSaveConfig(c), fn.getConfigSign(c)])
  }).then(([c, sign]) => {
    // 判断签名
    if (config.configSign === sign) {
      // 跳过保存
      return
    }
    // 回收变量
    sign = void 0
    if (!config.ddvConfigPath) {
      throw new Error('process.env.DDV_CONFIG_PATH and config.ddvConfigPath is empty')
    }
    fn.ddvConfigFile = config.ddvConfigFile || ddvPath.resolve(config.ddvConfigPath, 'config.json')
    // 开始保存
    return new Promise((resolve, reject) => {
      // 写入文件
      fs.writeFile(config.ddvConfigFile, JSON.stringify(c, '', 2), {
        encoding: 'utf8',
        mode: 0o666,
        flag: 'w'
      }, (e) => {
        e ? reject(e) : resolve()
      })
      c = void 0
    }).then(() => {
      return new Promise((resolve, reject) => {
        // 修改权限
        fs.chmod(config.ddvConfigFile, 0o666, (e) => {
          resolve()
        })
      })
    })
  })
}
// 签名配置信息，返回指定类型的hash值，用于判断config的内容是否变化了
fn.getConfigSign = function getConfigSign (signConfig, type = 'sha1') {
  var res
  // 编码
  res = buildParams(signConfig, '')
  // 回收
  signConfig = void 0
  // 强制是数组
  res = util.isArray(res) ? res : []
  // 排序
  res.sort()
  // 拼接数组
  res = res.join('&')
  // md5签名
  res = crypto.createHash(type).update(res).digest('hex')
  // 返回结果
  return Promise.resolve(res)
}
// 获取保存配置文件
fn.getSaveConfig = function getSaveConfig (saveConfig) {
  var c = Object.create(null)
  saveConfig = saveConfig || config
  return new Promise(function (resolve, reject) {
    for (let key in saveConfig) {
      // 跳过继承属性
      if (!Object.prototype.hasOwnProperty.call(saveConfig, key)) continue
      // 跳过continueKeys指定属性
      if (config.continueKeys && config.continueKeys.indexOf(key) > -1) continue
      // 跳过方法
      if (util.isFunction(saveConfig[key])) continue
      let type = util.type(saveConfig[key])
      switch (type) {
        case 'string':
        case 'number':
        case 'boolean':
          c[key] = saveConfig[key]
          break
        default :
          if (!c[key]) {
            c[key] = Object.create(null)
          }
          util.extend.call(c[key], true, c[key], saveConfig[key])
          continue
      }
      key = void 0
    }
    resolve(c)
    c = resolve = reject = void 0
  })
}
fn.getDdvConfigPath = function getDdvConfigPath () {
  return Promise.resolve().then(() => {
    if (process.env.DDV_CONFIG_PATH) {
      return Promise.resolve(process.env.DDV_CONFIG_PATH)
    }
    // 判断环境
    switch (config.platform) {
      case 'win':
      case 'win32':
      case 'win64':
        // winNt 环境
        return fn.getDdvConfigPathByWin()
      default:
        // unix 环境
        return fn.getDdvConfigPathByUnix()
    }
  }).then((ddvConfigPath) => {
    // 如果获取失败，使用默认值
    return ddvConfigPath || ddvPath(config.homePath, '.ddv')
  }).then((ddvConfigPath) => {
    return fn.checkDdvConfigPath(ddvConfigPath).catch((e) => {
      if (e.code !== 'ENOENT') {
        throw e
      }
      return new Promise((resolve, reject) => {
        mkdirp(ddvConfigPath, (err, made) => {
          err === null ? resolve(made) : reject(err)
        })
      }).then((made) => {
        return fn.checkDdvConfigPath(ddvConfigPath)
      })
    })
  })
}
fn.checkDdvConfigPath = function checkDdvConfigPath (ddvConfigPath) {
  return new Promise((resolve, reject) => {
      // 判断文件夹是否存在
    fs.stat(ddvConfigPath, (err, stats) => {
      if (!err) {
        let state = true
        state = state && stats.isDirectory()
        if (!state) {
          err = new Error('Configure the environment variable process.env.DDV_CONFIG_PATH')
        }
      }
      if (err) {
        err.error_id = 'DDV_CONFIG_PATH_ERROR'
        reject(err)
      } else {
        resolve(ddvConfigPath)
      }
    })
  })
}
fn.getDdvConfigPathByWin = function getDdvConfigPathByWin () {
  var drive = process.env.HOMEDRIVE || process.env.SystemDrive || 'C:'
  var p = ddvPath.resolve(drive + ddvPath.sep + ddvPath.sep, './ddv') + ddvPath.sep
  return Promise.resolve(p)
}
fn.getDdvConfigPathByUnix = function getDdvConfigPathByUnix () {
  var p = '/etc/ddv/'
  return Promise.resolve(p)
}
// 获取home路径
fn.getHomePath = function getHomePath () {
  // 获取 用户home目录
  var p = process.env.npm_package_config_home_path ||
          process.env.HOME_PATH ||
          process.env.HOME ||
          process.env.HOMEPATH ||
          process.env.USERPROFILE ||
          config.homePath
  p = ddvPath.resolve(p, '.')
  return Promise.resolve(p)
}
// 获取配置包配置
fn.getPackage = function getPackage () {
  config.pkg = fn.pkg = require(ddvPath('package.json'))
  // 返回结果
  return Promise.resolve(config.pkg)
}
// 获取语言环境
fn.getOsLocale = function getOsLocale () {
  return osLocale().then(function osLocaleRes (locale) {
    config.locale = locale
    return locale
  })
}
// 获取服务器唯一标识
fn.getServerGuid = function getServerGuid () {
  if (process.env.SERVER_GUID && serverGuid.isServerGuid(process.env.SERVER_GUID)) {
    return Promise.resolve(process.env.SERVER_GUID)
  }
  return serverGuid().then(function serverGuidRes (serverGuid) {
    config.serverGuid = serverGuid
    return serverGuid
  }).catch(e => {
    if (config.serverGuid) {
      return config.serverGuid
    } else {
      throw e
    }
  })
}
// 排除fn的方法
Array.prototype.push.apply(fn.continueKeys, Object.keys(fn))

// 同步获取
fn.getConfigSync = function getConfigSync (opt) {
}
