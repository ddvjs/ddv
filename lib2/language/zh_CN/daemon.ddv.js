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

    'CLI_STARTUP_DAEMON_TRY_RUN': '试图启动守护线程',

        'CLI_COMMAND_NOT_FOUND': '找不到命令:',
        'CLI_LISTEN_LOG_TAIL_CHANGE_START': '监听日志尾变化开始',
        'CLI_LISTEN_LOG_TAIL_DDV_TAIL_SUPPORTED': '不支持该类型',

    'CLI_COMMAND_ADD_STIE_FAIL': colors.red.bold('添加站点失败！'),
    'CLI_COMMAND_ADD_STIE_SUCCESS': colors.green.bold('添加网站成功！'),

    'CLI_COMMAND_GET_STIE_LISTS_FAIL': colors.red.bold('获取网站列表失败！'),

        'CLI_COMMAND_ARGUMENTS_NOT_EMPTY': colors.red.bold('命令行参数不能为空!'),

    'CLI_COMMAND_REMOVE_STIE_FAIL': colors.red.bold('删除站点失败!'),
    'CLI_COMMAND_START_STIE_FAIL': colors.red.bold('开启站点失败!'),
    'CLI_COMMAND_RESTART_STIE_FAIL': colors.red.bold('重启站点失败!'),
    'CLI_COMMAND_STOP_STIE_FAIL': colors.red.bold('停止站点失败!'),

    'CLI_COMMAND_START_SERVER_FAIL': colors.red.bold('开启服务失败!'),
    'CLI_COMMAND_RESTART_SERVER_FAIL': colors.red.bold('重启服务失败!'),
    'CLI_COMMAND_RELOAD_SERVER_FAIL': colors.red.bold('重载站点失败!'),
    'CLI_COMMAND_STOP_SERVER_FAIL': colors.red.bold('停止服务失败!'),

    'CLI_COMMAND_REMOVE_STIE_SUCCESS': colors.green.bold('删除站点成功!'),
    'CLI_COMMAND_START_STIE_SUCCESS': colors.green.bold('开启站点成功!'),
    'CLI_COMMAND_RESTART_STIE_SUCCESS': colors.green.bold('重启站点成功!'),
    'CLI_COMMAND_STOP_STIE_SUCCESS': colors.green.bold('停止站点成功!'),

    'CLI_COMMAND_START_SERVER_SUCCESS': colors.green.bold('开启服务成功!'),
    'CLI_COMMAND_RESTART_SERVER_SUCCESS': colors.green.bold('重启服务成功!'),
    'CLI_COMMAND_RELOAD_SERVER_SUCCESS': colors.green.bold('重载站点成功!'),
    'CLI_COMMAND_STOP_SERVER_SUCCESS': colors.green.bold('停止服务成功!'),

    'CLI_COMMAND_GUID_GET_FAIL': colors.red.bold('获取服务器guid失败!'),
    'CLI_COMMAND_GUID_GET_SUCCESS': colors.green.bold('获取服务器guid成功!'),
    'CLI_COMMAND_GUID_SET_FAIL': colors.red.bold('设置服务器guid失败!'),
    'CLI_COMMAND_GUID_SET_SUCCESS': colors.green.bold('设置服务器guid成功!'),
    'CLI_COMMAND_GUID_TIP': colors.green.bold('GUID:'),

    'DAEMON_RUN_EXIT_EVENT_TIP': '收到系统要求退出信号',
    'DAEMON_RUN_RES_DAEMON_REPEAT': '后台守护线程被重复启动',
    'DAEMON_RUN_RES_DAEMON_SUCCSS': '后台守护线程启动成功',
    'DAEMON_RUN_RES_DAEMON_FAIL': '后台守护线程启动失败',
    'DAEMON_RUN_SERVER_API_START': '后台守护线程对外RPC-API服务启动中'
  }
  return l
}
