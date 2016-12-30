#!/bin/bash
# chkconfig: 2345 98 02
#
# description: DDV next gen process manager for Node.js
# processname: ddv
#
### BEGIN INIT INFO
# Provides:          ddv
# Required-Start: $local_fs $remote_fs
# Required-Stop: $local_fs $remote_fs
# Should-Start: $network
# Should-Stop: $network
# Default-Start:        2 3 4 5
# Default-Stop:         0 1 6
# Short-Description: DDV init script
# Description: DDV is the next gen process manager for Node.js
### END INIT INFO

NAME=ddv
DDV=%DDV_PATH%
USER=%USER%
DEFAULT=/etc/default/$NAME

export PATH=%NODE_PATH%:$PATH
export DDV_HOME_PATH="%DDV_HOME_PATH%"
export DDV_CONFIG_PATH="%DDV_CONFIG_PATH%"
export DDV_OUT_LOG_FILE_PATH="%DDV_OUT_LOG_FILE_PATH%"
export DDV_ERR_LOG_FILE_PATH="%DDV_ERR_LOG_FILE_PATH%"
export HOME_PATH="%HOME_PATH%"

# The following variables can be overwritten in $DEFAULT

# maximum number of open files
MAX_OPEN_FILES=

# overwrite settings from default file
if [ -f "$DEFAULT" ]; then
	  . "$DEFAULT"
fi

# set maximum open files if set
if [ -n "$MAX_OPEN_FILES" ]; then
    ulimit -n $MAX_OPEN_FILES
fi

get_user_shell() {
    local shell=$(getent passwd ${1:-`whoami`} | cut -d: -f7 | sed -e 's/[[:space:]]*$//')

    if [[ $shell == *"/sbin/nologin" ]] || [[ $shell == "/bin/false" ]] || [[ -z "$shell" ]];
    then
      shell="/bin/bash"
    fi

    echo "$shell"
}

super() {
    local shell=$(get_user_shell $USER)
    su - $USER -s $shell -c "PATH=$PATH; DDV_HOME_PATH=$DDV_HOME_PATH DDV_CONFIG_PATH=$DDV_CONFIG_PATH DDV_OUT_LOG_FILE_PATH=$DDV_OUT_LOG_FILE_PATH DDV_ERR_LOG_FILE_PATH=$DDV_ERR_LOG_FILE_PATH HOME_PATH=$HOME_PATH $*"
}

start() {
    echo "Starting $NAME"
    super $DDV resurrect
}

stop() {
    #super $DDV dump
    super $DDV stop
    super $DDV kill
}

restart() {
    echo "Restarting $NAME"
    stop
    start
}

reload() {
    echo "Reloading $NAME"
    super $DDV reload all
}

status() {
    echo "Status for $NAME:"
    super $DDV list
    RETVAL=$?
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        restart
        ;;
    reload)
        reload
        ;;
    force-reload)
        reload
        ;;
    *)
        echo "Usage: {start|stop|status|restart|reload|force-reload}"
        exit 1
        ;;
esac
exit $RETVAL
