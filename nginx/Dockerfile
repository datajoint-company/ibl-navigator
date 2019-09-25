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

# HEALTHCHECK       \
#     --timeout=3s \ 
#     --retries=20  \
#     CMD           \
#         # curl --fail https://djcompute.internationalbrainlab.org:443 || exit 1
#         curl --fail -k https://localhost:443 || exit 1 #switch to this one for testdev deploy

HEALTHCHECK \
    --interval=1s \
    --timeout=3s \
    CMD \
        wget --no-check-certificate --quiet --tries=20 --spider https://localhost:443 || exit 1