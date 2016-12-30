#!/bin/bash
#
# ddv Process manager for NodeJS
#
# chkconfig: 345 80 20
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

export PATH=%NODE_PATH%:$PATH
export DDV_HOME_PATH="%DDV_HOME_PATH%"
export DDV_CONFIG_PATH="%DDV_CONFIG_PATH%"
export DDV_OUT_LOG_FILE_PATH="%DDV_OUT_LOG_FILE_PATH%"
export DDV_ERR_LOG_FILE_PATH="%DDV_ERR_LOG_FILE_PATH%"
export HOME_PATH="%HOME_PATH%"

lockfile="/var/lock/subsys/ddv-init.sh"

super() {
    su - $USER -c "PATH=$PATH; DDV_HOME_PATH=$DDV_HOME_PATH DDV_CONFIG_PATH=$DDV_CONFIG_PATH DDV_OUT_LOG_FILE_PATH=$DDV_OUT_LOG_FILE_PATH DDV_ERR_LOG_FILE_PATH=$DDV_ERR_LOG_FILE_PATH HOME_PATH=$HOME_PATH $*"
}

start() {
    echo "Starting $NAME"
    super $DDV resurrect
    retval=$?
    [ $retval -eq 0 ] && touch $lockfile
}

stop() {
    echo "Stopping $NAME"
    #super $DDV dump
    super $DDV stop
    super $DDV kill
    rm -f $lockfile
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
    *)
        echo "Usage: {start|stop|status|restart|reload}"
        exit 1
        ;;
esac
exit $RETVAL
