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

# HEALTHCHECK \ # from public demo
#     --interval=1s \
#     --timeout=5s \
#     --retries=300 \
#     CMD \
#         wget --no-check-certificate --quiet --tries=1 --spider https://localhost:443 || exit 1
#         # wget --quiet --tries=20 --spider https://testdev.datajoint.io:443 || exit 1