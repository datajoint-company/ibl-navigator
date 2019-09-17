#! /bin/bash

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /etc/nginx/nginx.conf
sed -i "s|{{URL}}|${URL}|g" /etc/nginx/nginx.conf
sed -i "s|{{NODE_SERVER}}|${NODE_SERVER}|g" /etc/nginx/nginx.conf
sed -i "s|{{FRONTEND_SERVER}}|${FRONTEND_SERVER}|g" /etc/nginx/nginx.conf

# /init
nginx -g daemon off