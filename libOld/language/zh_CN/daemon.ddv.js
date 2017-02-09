module.exports = function (colors) {
  var l
  l = {
    'CLI_STARTUP_TRY_INIT': '试图加入自动启动服务',
    'CLI_STARTUP_TRY_SUCCESS': '加入自动启动服务成功',
    'CLI_STARTUP_THIS_OS_IS_WIN': '该系统是 WinNT 内核',
    'CLI_STARTUP_THIS_OS_IS_UNIX': '该系统是 Unix 内核',
    'CLI_STARTUP_GENERATING_SYSTEM_IN': '生成系统的自动启动脚本 ',
    'CLI_STARTUP_GENERATING_SYSTEM_ERROR': '生成系统的自动启动脚本错误 ',
    'CLI_STARTUP_PROBLEM_TRY_WRITE_ERROR': '试图写入系统启动文件时出现问题: ',
    'CLI_STARTUP_MAKING_BOOTING_AT_STARTUP': '设置脚本在启动时自动启动...',
    'CLI_STARTUP_LOCKFILE_HAS_BEEN_ADDED': '文件已被添加锁',
    'CLI_STARTUP_USING_THE_COMMAND': '运行命令',
    'CLI_STARTUP_RUN_CMD_ERROR': '运行命令错误',
    'CLI_STARTUP_DONE': '完成',
    'CLI_STARTUP_USE_RIGHT_PLATFORM': '-----你确定你使用了正确的平台命令行选项？centos / redhat, amazon, ubuntu, gentoo, systemd or darwin ?',
    'CLI_STARTUP_NOT_USER_ROOT_RUN_COMMAND': '无权操作，请您以管理员身份运行以下命令: ',

    'CLI_STARTUP_DAEMON_TRY_RUN': '试图启动守护线程'

  }
  return l
}
