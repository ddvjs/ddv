'use strict'
/* eslint-disable no-template-curly-in-string */
module.exports = {
  output: {
    description: {
      help: 'output usage information',
      version: 'Get the dvd version information',
      site_name: 'site name',
      site_id: 'site id',
      no_run_daemon: 'Do not start background daemon threads',
      silent: 'hide all messages'
    }
  },
  help: {
    examples: {
      add_site: 'Add an site',
      add_siteand_name: 'Add an site + set a name',
      remove_site_by_id: 'Removes site from the list in the DDV server by ID',
      remove_site_by_name: 'Removes site from the list in the DDV server by stie_name',

      start_ddv_server: 'Start ddv server',
      restart_ddv_server: 'Restart ddv server',
      reload_ddv_server: 'Reload ddv server',
      stop_ddv_server: 'Stop ddv server',
      kill_ddv_server: 'Kill daemon ddv',
      update_ddv_server: 'Update ddv',

      more_examples_in: 'More examples in',
      more_help: 'More help',

      add_site_help: 'Add site help',
      remove_site_help: 'Remove site help'
    },
    command: {
      tail: '\'site_name\' is the name of the site, The function of this command is to monitor the log changes, and real-time output'
    }
  },
  command: {
    tail: {
      watch_log_start: 'Listen to the log tail change start',
      not_supported: 'This type is not supported'
    }
  }
}
