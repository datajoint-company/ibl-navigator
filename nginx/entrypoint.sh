#! /bin/sh

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /etc/nginx/site-confs/app.conf
sed -i "s|{{URL}}|${URL}|g" /etc/nginx/site-confs/app.conf
sed -i "s|{{NODE_SERVER}}|${NODE_SERVER}|g" /etc/nginx/site-confs/app.conf
sed -i "s|{{FRONTEND_SERVER}}|${FRONTEND_SERVER}|g" /etc/nginx/site-confs/app.conf

# /init
# nginx -g daemon off
nginx