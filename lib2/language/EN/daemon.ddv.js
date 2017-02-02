module.exports = function (colors) {
  var l
  l = {
    'CLI_STARTUP_TRY_INIT': 'Attempt to join the auto-start service',
    'CLI_STARTUP_TRY_SUCCESS': 'Join the auto-start service successfully',
    'CLI_STARTUP_THIS_OS_IS_WIN': 'The system is Win NT kernel',
    'CLI_STARTUP_THIS_OS_IS_UNIX': 'The system is Unix kernel',
    'CLI_STARTUP_GENERATING_SYSTEM_IN': 'Generating system init script in ',
    'CLI_STARTUP_GENERATING_SYSTEM_ERROR': 'Generating system init script ERROR ',
    'CLI_STARTUP_PROBLEM_TRY_WRITE_ERROR': 'There is a problem when trying to write file :  ',
    'CLI_STARTUP_MAKING_BOOTING_AT_STARTUP': 'Making script booting at startup...',
    'CLI_STARTUP_LOCKFILE_HAS_BEEN_ADDED': 'lockfile has been added',
    'CLI_STARTUP_USING_THE_COMMAND': 'Using the command',
    'CLI_STARTUP_RUN_CMD_ERROR': 'Run command error',
    'CLI_STARTUP_DONE': 'Done.',
    'CLI_STARTUP_USE_RIGHT_PLATFORM': '----- Are you sure you use the right platform command line option ? centos / redhat, amazon, ubuntu, gentoo, systemd or darwin?',
    'CLI_STARTUP_NOT_USER_ROOT_RUN_COMMAND': 'You have to run this command as root. Execute the following command: ',

    'CLI_STARTUP_DAEMON_TRY_RUN': 'Attempt to start a daemon thread',

    'CLI_COMMAND_NOT_FOUND': 'Command not found:',
        'CLI_LISTEN_LOG_TAIL_CHANGE_START': 'Listen to the log tail change start',
        'CLI_LISTEN_LOG_TAIL_DDV_TAIL_SUPPORTED': 'This type is not supported',

    'CLI_COMMAND_ADD_STIE_FAIL': colors.red.bold('add site fail!'),
    'CLI_COMMAND_ADD_STIE_SUCCESS': colors.green.bold('add site success!'),

    'CLI_COMMAND_GET_STIE_LISTS_FAIL': colors.red.bold('get site lists fail!'),

    'CLI_COMMAND_ARGUMENTS_NOT_EMPTY': colors.red.bold('The command line argument can not be null!'),

    'CLI_COMMAND_REMOVE_STIE_FAIL': colors.red.bold('Remove a site failed!'),
    'CLI_COMMAND_START_STIE_FAIL': colors.red.bold('Start a site failed!'),
    'CLI_COMMAND_RESTART_STIE_FAIL': colors.red.bold('Restart a site failed!'),
    'CLI_COMMAND_STOP_STIE_FAIL': colors.red.bold('Stop a site failed!'),

    'CLI_COMMAND_START_SERVER_FAIL': colors.red.bold('Start ddv server failed!'),
    'CLI_COMMAND_RESTART_SERVER_FAIL': colors.red.bold('Restart ddv server failed!'),
    'CLI_COMMAND_RELOAD_SERVER_FAIL': colors.red.bold('Reload site failed!'),
    'CLI_COMMAND_STOP_SERVER_FAIL': colors.red.bold('Stop ddv server failed!'),

    'CLI_COMMAND_REMOVE_STIE_SUCCESS': colors.green.bold('Remove a site success!'),
    'CLI_COMMAND_START_STIE_SUCCESS': colors.green.bold('Start a site success!'),
    'CLI_COMMAND_RESTART_STIE_SUCCESS': colors.green.bold('Restart a site success!'),
    'CLI_COMMAND_STOP_STIE_SUCCESS': colors.green.bold('Stop a site success!'),

    'CLI_COMMAND_START_SERVER_SUCCESS': colors.green.bold('Start ddv server success!'),
    'CLI_COMMAND_RESTART_SERVER_SUCCESS': colors.green.bold('Restart ddv server success!'),
    'CLI_COMMAND_RELOAD_SERVER_SUCCESS': colors.green.bold('Reload site success!'),
    'CLI_COMMAND_STOP_SERVER_SUCCESS': colors.green.bold('Stop ddv server success!'),

    'CLI_COMMAND_GUID_GET_FAIL': colors.red.bold('get the server GUID failed!'),
    'CLI_COMMAND_GUID_GET_SUCCESS': colors.green.bold('get the server GUID success!'),
    'CLI_COMMAND_GUID_SET_FAIL': colors.red.bold('Setting the server GUID failed!'),
    'CLI_COMMAND_GUID_SET_SUCCESS': colors.green.bold('Setting the server GUID success!'),
    'CLI_COMMAND_GUID_TIP': colors.green.bold('GUID:'),

    'DAEMON_RUN_EXIT_EVENT_TIP': 'System requirements receive exit signals',
    'DAEMON_RUN_RES_DAEMON_REPEAT': 'Daemon thread is repeated start',
    'DAEMON_RUN_RES_DAEMON_SUCCSS': 'Daemon threads started successfully',
    'DAEMON_RUN_RES_DAEMON_FAIL': 'Daemon thread failed to start',
    'DAEMON_RUN_SERVER_API_START': 'The daemon thread is in the outbound RPC-API service startup'
  }
  return l
}
