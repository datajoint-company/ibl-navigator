FROM nginx:1.15-alpine

COPY ./data/nginx /etc/nginx/conf.d
COPY ./data/certbot/conf /etc/letsencrypt
# COPY ./data/certbot/www /var/www/certbot