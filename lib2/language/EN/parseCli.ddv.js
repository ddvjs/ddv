module.exports = function (colors) {
  var l
  l = {
        'OPTION_DESCRIPTION_HELP': 'output usage information',
        'OPTION_DESCRIPTION_VERSION': 'Get the dvd version information',
        'OPTION_DESCRIPTION_DEBUG': 'open debug',
        'OPTION_DESCRIPTION_SITE_NAME': 'site name',
        'OPTION_DESCRIPTION_SITE_ID': 'site id',
        'OPTION_DESCRIPTION_NO_RUN_DAEMON': 'Do not start background daemon threads',
        'OPTION_DESCRIPTION_SILENT': 'hide all messages',

        'HELP_EXAMPLES_SHOW_ADD_SITE': 'Add an site',
        'HELP_EXAMPLES_SHOW_ADD_SITEAND_NAME': 'Add an site + set a name',
        'HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_ID': 'Removes site from the list in the DDV server by ID',
        'HELP_EXAMPLES_SHOW_REMOVE_SITE_BY_NAME': 'Removes site from the list in the DDV server by stie_name',

        'HELP_EXAMPLES_SHOW_START_DDV_SERVER': 'Start ddv server',
        'HELP_EXAMPLES_SHOW_RESTART_DDV_SERVER': 'Restart ddv server',
        'HELP_EXAMPLES_SHOW_RELOAD_DDV_SERVER': 'Reload ddv server',
        'HELP_EXAMPLES_SHOW_STOP_DDV_SERVER': 'Stop ddv server',
        'HELP_EXAMPLES_SHOW_KILL_DDV_SERVER': 'Kill daemon ddv',
        'HELP_EXAMPLES_SHOW_UPDATE_DDV_SERVER': 'Update ddv',

        'HELP_EXAMPLES_SHOW_MORE_EXAMPLES_IN': 'More examples in',
        'HELP_EXAMPLES_SHOW_MORE_HELP': 'More help',

        'HELP_EXAMPLES_SHOW_ADD_SITE_HELP': 'Add site help',
        'HELP_EXAMPLES_SHOW_REMOVE_SITE_HELP': 'Remove site help',

    'COMMAND_ADD_AN_SITE_AND_SITEAND_NAME': 'Add an site + set a name',
    'COMMAND_REMOVE_AN_SITE': 'Remove an site',
    'COMMAND_REMOVE_ALIAS_AN_SITE': '(remove alias) Remove an site',

    'COMMAND_START': 'Start ddv server or start site',
    'COMMAND_RESTART': 'Restart ddv server or start site',
    'COMMAND_RELOAD': 'Reload the ddv server site changes',
    'COMMAND_STOP': 'Stop ddv server or stop site',

    'COMMAND_LISTS': 'list all site',
    'COMMAND_LISTS_ALIAS': '(lists alias) list all site',
    'COMMAND_LISTS_JSON': 'list all site in JSON format',
    'COMMAND_LISTS_JSON_PRETTIFIED': 'print json in a prettified JSON',

    'COMMAND_KILL_DAEMON_DDV': 'Kill daemon ddv',
    'COMMAND_RESURRECT': 'Restart the process before the resurrection',
    'COMMAND_HELP': 'show command help',

    'COMMAND_TAIL': '\'site_name\' is the name of the site, The function of this command is to monitor the log changes, and real-time output'
  }
  return l
}
