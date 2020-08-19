FROM raphaelguzman/djlab:py3.6-debian

# RUN \
#     pip uninstall -y datajoint && \
#     pip install \
#         git+https://github.com/dimitri-yatsenko/datajoint-python.git@dev#egg=datajoint-python

RUN pip install --upgrade --pre datajoint

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        wget --quiet --tries=1 --spider http://localhost:5000/v0/lab > /dev/null 2>&1 || exit 1


ENTRYPOINT ["/src/iblapi/run-ibl-api.prod.sh"]

# for production builds
RUN mkdir -p /src/iblapi
COPY --chown=dja:anaconda ["notebooks", "/src/iblapi/notebooks"]
COPY --chown=dja:anaconda ["./*.txt", "./*.sh", "./*.rst", "./*.py", "/src/iblapi/"]

RUN \
    pip install -e /src/iblapi && \
    chmod +x /src/iblapi/run-ibl-api.prod.sh && \
    chmod +x /src/iblapi/run-ibl-api.dev.sh

# COPY --chown=dja:anaconda ["tests", "/src/iblapi/tests"]