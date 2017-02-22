// NpmWhich 查看命令所在目录
const NpmWhich = require('npm-which')
// 路径模块
const path = require('path')
// 文件系统模块
const fs = require('fs')
// 判断是否为Windows
const isWin = process.platform === 'win32'
// 设置环境变量的正则
const envSetterRegex = /(\w+)=('(.+)'|"(.+)"|(.+))/
// Unix
const envUseUnixRegex = /\$(\w+)/g // $my_var
// Win
const envUseWinRegex = /%(.*?)%/g // %my_var%
// envExtract
const envExtract = isWin ? envUseUnixRegex : envUseWinRegex
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
    // 建立Which
    let npmWhich = NpmWhich(options.cwd)
    // 去除左右空格-解析命令行为数组
    let argv = which.commandParseStrToArray(command.trim())
    // 提取命令
    command = argv.shift()
    // 如果第一个参数是 cross-env 这种环境变量的库，就直接去除
    switch (path.basename(command || '')) {
      case 'cross-env':
        break
      default:
        // 否则补充回去
        argv.unshift(command)
        break
    }
    let tempRes = which.getCommandArgsAndEnvVars(argv, options.env)
    command = tempRes[0]
    args = tempRes[1]
    // 试图查找js文件路径 获取命令的文件名来判断
    switch (path.basename(command || '')) {
      case 'node':
      case 'node.exe':
        // 因为不能使用node的 fork 来运行node
        // 另外说明第一个参数就是 node.js文件了
        commandFile = args.shift()
        break
      default:
        // 获取命令行文件地址，建议使用同步模式，
        // 由npmWhich原理可以看出，同步模式减少意外
        commandFile = npmWhich.sync(command, options) || commandFile
        break
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

Object.assign(which, {
  commandParseStrToArray (str) {
    if (Array.isArray(str)) {
      return str
    }
    // 如果可以转字符串就自动转字符串
    if (str.toString && typeof str.toString === typeof function () {}) {
      str = str.toString()
    }
    if (typeof str !== typeof '') {
    // 不是字符串就抛出错误抛出错误
      throw new PackageError('The command in Package.json is not a string or an array')
    }
    var result = []
    var inQuote = false
    var currentWord = ''

    str.split('').forEach(function (token, tokenIndex, pieces) {
      if (tokenIndex > 0 && pieces[tokenIndex - 1] === '\\') {
        currentWord += token
        return
      }

      if (token === '"') {
        inQuote = !inQuote
        if (!inQuote && currentWord.length) {
          result.push(currentWord)
          currentWord = ''
        }
        return
      }

      if (token === ' ' && !inQuote) {
        if (currentWord.length) {
          result.push(currentWord)
          currentWord = ''
        }
        return
      }

      currentWord += token
    })

    if (currentWord.length) {
      result.push(currentWord)
    }

    return result
  },
  getCommandArgsAndEnvVars (args, envVars) {
    // eslint-disable-line
    let command
    envVars = envVars || Object.assign({}, process.env)
    const commandArgs = args.map(which.commandConvert)
    while (commandArgs.length) {
      const shifted = commandArgs.shift()
      const match = envSetterRegex.exec(shifted)
      if (match) {
        envVars[match[1]] = match[3] || match[4] || match[5]
      } else {
        command = shifted
        break
      }
      if (process.env.APPDATA) {
        envVars.APPDATA = process.env.APPDATA
      }
    }
    return [command, commandArgs, envVars]
  },
  /**
   * Converts an environment variable usage to be appropriate for the current OS
   * @param {String} command Command to convert
   * @returns {String} Converted command
   */
  commandConvert (command) {
    const match = envExtract.exec(command)
    if (match) {
      command = isWin ? `%${match[1]}%` : `$${match[1]}`
    }
    return command
  }
})

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
