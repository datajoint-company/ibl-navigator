# FROM nginx:1.15-alpine

# COPY ./data/nginx /etc/nginx/conf.d
# COPY ./data/certbot/conf /etc/letsencrypt
# # COPY ./data/certbot/www /var/www/certbot

FROM linuxserver/letsencrypt
RUN \
    mkdir -p /run/nginx && \
    rm -R /config/* && \
    mkdir -p /config/nginx
# COPY ./data/nginx /config

COPY ./data/nginx/app.conf /config/nginx/nginx.conf
COPY ./data/nginx/ssl.conf /config/nginx/ssl.conf