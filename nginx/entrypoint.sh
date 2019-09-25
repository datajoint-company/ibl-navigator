#! /bin/sh

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /etc/nginx/conf.d/base.conf
sed -i "s|{{URL}}|${URL}|g" /etc/nginx/conf.d/base.conf
sed -i "s|{{NODE_SERVER}}|${NODE_SERVER}|g" /etc/nginx/conf.d/base.conf
sed -i "s|{{FRONTEND_SERVER}}|${FRONTEND_SERVER}|g" /etc/nginx/conf.d/base.conf
sed -i "s|{{LETSENCRYPT_SERVER}}|${LETSENCRYPT_SERVER}|g" /etc/nginx/conf.d/base.conf

sed -i "s|{{SUBDOMAINS}}|${SUBDOMAINS}|g" /ssl.conf
sed -i "s|{{URL}}|${URL}|g" /ssl.conf
sed -i "s|{{NODE_SERVER}}|${NODE_SERVER}|g" /ssl.conf
sed -i "s|{{FRONTEND_SERVER}}|${FRONTEND_SERVER}|g" /ssl.conf
sed -i "s|{{LETSENCRYPT_SERVER}}|${LETSENCRYPT_SERVER}|g" /ssl.conf

# /init
# nginx -g "daemon off;"
nginx

echo "Waiting for initial certs"
while [ ! -d /etc/letsencrypt/archive/${SUBDOMAINS}.${URL} ]; do
    sleep 5
done

echo "Enabling SSL feature"
mv /ssl.conf /etc/nginx/conf.d/ssl.conf
nginx -s reload

inotifywait -m /etc/letsencrypt/archive/${SUBDOMAINS}.${URL} |
    while read path action file; do
        echo "Renewal: Reloading NGINX since $file issue $action event"
        nginx -s reload
    done