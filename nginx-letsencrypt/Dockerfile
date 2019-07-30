FROM linuxserver/letsencrypt

COPY ./app.conf /config/nginx/site-confs/app.conf

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail https://localhost:443 || exit 1