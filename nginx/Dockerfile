# FROM linuxserver/letsencrypt
FROM nginx:alpine

COPY ./base.conf /etc/nginx/conf.d/base.conf
COPY ./ssl.conf /ssl.conf

COPY ./entrypoint.sh /entrypoint.sh
RUN \
    apk update && \
    apk add inotify-tools && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# COPY ./fullchain.pem /etc/letsencrypt/live/testdev.datajoint.io/fullchain.pem
# COPY ./privkey.pem /etc/letsencrypt/live/testdev.datajoint.io/privkey.pem
