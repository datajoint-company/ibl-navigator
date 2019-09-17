#! /bin/bash

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /config/nginx/site-confs/app.conf
sed -i "s|{{URL}}|${URL}|g" /config/nginx/site-confs/app.conf
sed -i "s|{{NODE_SERVER}}|${NODE_SERVER}|g" /config/nginx/site-confs/app.conf
sed -i "s|{{FRONTEND_SERVER}}|${FRONTEND_SERVER}|g" /config/nginx/site-confs/app.conf

/init
# nginx -g daemon off