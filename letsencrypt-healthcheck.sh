#! /bin/bash

if [ $(expr $(date +%s) - $(stat -c %Y $(ls -la /config/etc/letsencrypt/live/*.*/fullchain.pem | awk '{print sprintf("%s/%s", "/config/etc/letsencrypt/live/*.*", $11)}'))) -lt "7776000" ]; then exit 0;else exit 1;fi