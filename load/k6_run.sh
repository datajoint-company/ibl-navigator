#!/bin/sh

# Basic load test that runs 3 consecutive runs of a configurable number of virtual users
# (VUS) that simultaneously access the POST /sessions endpoint and measure if the number
# of err'ed responses is less than or equal to threshold (FAILURE_RATE) consistently.
# 
# Initially will query the endpoint to load cache (if applicable).

apk add curl jq

export TOKEN=$(curl -X POST https://${SUBDOMAIN}.${DOMAIN}/api/login -H 'Content-Type: application/json' -d '{"username":"'${DEMO_USERNAME}'","password":"'${DEMO_PASSWORD}'"}' | jq -r .token)

date
curl "https://${SUBDOMAIN}.${DOMAIN}/api/sessions" -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' --data-raw '{"__order":"session_start_time DESC"}' -o /dev/null -w "time_total: %{time_total}s\ncode: %{http_code}\n" 2>/dev/null

k6 run test_simultaneous_users.js && k6 run test_simultaneous_users.js && k6 run test_simultaneous_users.js
