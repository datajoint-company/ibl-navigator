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

INIT_TIME=$(date +%s)
LAST_MOD_TIME=$(date -r $(echo /etc/letsencrypt/live/${SUBDOMAINS}.${URL}/$(ls -t /etc/letsencrypt/live/${SUBDOMAINS}.${URL}/ | head -n 1)) +%s)
DELTA=$(expr $LAST_MOD_TIME - $INIT_TIME)
while true; do
    CURR_FILEPATH=$(ls -t /etc/letsencrypt/live/${SUBDOMAINS}.${URL}/ | head -n 1)
    CURR_LAST_MOD_TIME=$(date -r $(echo /etc/letsencrypt/live/${SUBDOMAINS}.${URL}/${CURR_FILEPATH}) +%s)
    CURR_DELTA=$(expr $CURR_LAST_MOD_TIME - $INIT_TIME)
    if [ "$DELTA" -lt "$CURR_DELTA" ]; then
        echo "[$(date -u '+%Y-%m-%d %H:%M:%S')][DataJoint]: Renewal: Reloading NGINX since \`$CURR_FILEPATH\` changed."
        update_cert
        DELTA=$CURR_DELTA
    else
        sleep 5
    fi
done