#! /bin/sh
export FLASK_APP=./iblapi.py
[ "$1" = "development" ] && export FLASK_ENV=development
exec flask run
