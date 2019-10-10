#! /bin/sh
export FLASK_APP=./iblapi.py
[ "$1" = "development" ] && args="--log-level=debug" || args=""
cd "`dirname $0`" && exec gunicorn -t 600 -w $WORKER_COUNT -b 0.0.0.0:5000 $args iblapi-gunicorn
