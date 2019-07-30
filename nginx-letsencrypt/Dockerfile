# FROM nginx:1.15-alpine

# COPY ./data/nginx /etc/nginx/conf.d
# COPY ./data/certbot/conf /etc/letsencrypt
# # COPY ./data/certbot/www /var/www/certbot

FROM linuxserver/letsencrypt
RUN \
    mkdir -p /run/nginx
    #  && \
    # rm /config/* && \
    # mkdir -p /config/nginx
# COPY ./config /config

# COPY ./data/nginx/app.conf /config/nginx/nginx.conf
# COPY ./data/nginx/ssl.conf /config/nginx/ssl.conf

COPY ./config/nginx/app.conf /config/nginx/site-confs/testdev