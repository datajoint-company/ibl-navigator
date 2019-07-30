#! /bin/bash

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /config/nginx/site-confs/app.conf
sed -i "s|{{URL}}|${URL}|g" /config/nginx/site-confs/app.conf

/init??