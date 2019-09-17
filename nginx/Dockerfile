# FROM linuxserver/letsencrypt
FROM nginx:alpine

COPY ./app.conf /etc/nginx/site-confs/app.conf

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        # curl --fail https://djcompute.internationalbrainlab.org:443 || exit 1
        curl --fail -k https://localhost:443 || exit 1 #switch to this one for testdev deploy