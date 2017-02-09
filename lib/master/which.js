// NpmWhich 查看命令所在目录
const NpmWhich = require('npm-which')
// 路径模块
const path = require('path')
// 文件系统模块
const fs = require('fs')
// 导出模块
const which = module.exports = function which (commandDir) {
  // 定义线程文件
  let commandFile = commandDir || 'index.js'
  // 配置文件
  let pkgFile = path.join(commandDir, 'package.json')
  // 命令行
  let command = ''
  // 参数
  let args = []
  // 构造参数
  let options = {
    silent: true,
    cwd: commandDir,
    env: Object.create(null)
  }
  for (let key in process.env) {
    options.env[key] = process.env[key]
  }
  options.env.PWD = options.cwd

  if (fs.existsSync(pkgFile)) {
    let pkgOptions = Object.create(null)
    try {
      // 试图引入配置文件
      pkgOptions = require(pkgFile)
    } catch (e) {
      // 抛出错误
      throw new PackageError('Package.json format error, get script failed')
    }
    // 取得
    let scripts = pkgOptions.scripts || Object.create(null)
    // 试图判断是否存在 npm run ddvstart
    if (scripts.ddvstart) {
      // 取得命令行 npm run ddvstart
      command = scripts.ddvstart || command
    } else if (scripts.start) {
      // 取得命令行 npm run start
      command = scripts.start || command
    } else if (scripts.run) {
      // 取得命令行 npm run run
      command = scripts.run || command
    }
  }
  if (command) {
    let npmWhich, commandBasename
    // 建立Which
    npmWhich = NpmWhich(options.cwd)
    // 解析命令行为数组
    args = command.split(' ')
    // 提取命令
    command = args.shift()
    // 获取命令的文件名
    commandBasename = path.basename(command)
    // 判断命令是否为node
    if (commandBasename === 'node' || commandBasename === 'node.exe') {
      // 因为不能node 运行node 所以截取掉
      commandFile = args.shift()
    } else {
      // 获取命令行文件地址，建议使用同步模式，
      // 由npmWhich原理可以看出，同步模式减少意外
      commandFile = npmWhich.sync(command, options) || commandFile
    }
  } else if (fs.existsSync(commandDir)) {
    let stat = fs.lstatSync(commandDir)
    if (stat.isFile()) {
      // 如果是文件,返回上层目录
      options.cwd = path.dirname(options.cwd)
    }
  } else {
    // 不是命令行或者文件夹或者文件
    throw new PackageError('Do not find the ddvstart or start method of Package.json, make sure that npm run ddvstart can be used')
  }
  options.env.PWD = options.cwd

  return {
    file: commandFile,
    args: args,
    options: options
  }
}
// 配置错误
const PackageError = which.PackageError = class PackageError extends Error {
  // 构造函数
  constructor (message, stack) {
    // 调用父类构造函数
    super(message)
    this.name = this.name || 'Error'
    this.type = this.type || 'PackageError'
    this.stack += stack ? ('\n' + stack) : ''
    message = stack = void 0
  }
}
