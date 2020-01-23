#! /bin/sh

update_cert() {
    nginx -s reload
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S')][DataJoint]: Certs updated."
}

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

echo "[$(date -u '+%Y-%m-%d %H:%M:%S')][DataJoint]: Waiting for initial certs"
while [ ! -d /etc/letsencrypt/archive/${SUBDOMAINS}.${URL} ]; do
    sleep 5
done

echo "[$(date -u '+%Y-%m-%d %H:%M:%S')][DataJoint]: Enabling SSL feature"
mv /ssl.conf /etc/nginx/conf.d/ssl.conf
update_cert

inotifywait -m /etc/letsencrypt/live/${SUBDOMAINS}.${URL} |
    while read path action file; do
        if [ "$(echo $action | grep MODIFY)" ] || [ "$(echo $action | grep CREATE)" ] || [ "$(echo $action | grep MOVE)" ]; then
            echo "[$(date -u '+%Y-%m-%d %H:%M:%S')][DataJoint]: Renewal: Reloading NGINX since $file issue $action event"
            update_cert
        fi
    done