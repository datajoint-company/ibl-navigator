FROM linuxserver/letsencrypt

COPY ./app.conf /config/nginx/site-confs/app.conf

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        # curl --fail https://localhost:443 || exit 1
        curl --fail -k https://localhost:443 || exit 1