#!/bin/sh

apk add curl jq

export TOKEN=$(curl -X POST https://${SUBDOMAIN}.${DOMAIN}/api/login -H 'Content-Type: application/json' -d '{"username":"'${DEMO_USERNAME}'","password":"'${DEMO_PASSWORD}'"}' | jq -r .token)

k6 run k6_script.js && k6 run k6_script.js && k6 run k6_script.js

# k6 run k6_script.js


# echo $TOKEN

tail -f /dev/null


# notes:
# - config by: updating {{TEMP_HOST}} and {{TEMP_TOKEN}} with appropriate ibl-nav host/token in k6 files
# - run using: docker run --name k6 --rm --workdir /tmp -v /github/raphael/ibl-navigator-root/ibl-navigator/k6_test1.js:/tmp/k6_test1.js -v /github/raphael/ibl-navigator-root/ibl-navigator/k6_script.js:/tmp/k6_script.js -v /github/raphael/ibl-navigator-root/ibl-navigator/k6_run.sh:/tmp/k6_run.sh -it --entrypoint=sh loadimpact/k6:0.26.2 -c "./k6_run.sh"
# k6 run k6_script.js
# k6 run k6_script.js
# k6 run k6_script.js
# k6 run k6_script.js | grep checks
# k6 run k6_script.js | grep checks