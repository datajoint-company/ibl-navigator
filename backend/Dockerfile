FROM datajoint/jupyter:python3.6

#RUN pip uninstall -y datajoint && pip install git+https://github.com/dimitri-yatsenko/datajoint-python.git@dev#egg=datajoint-python

RUN pip install --upgrade --pre datajoint

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail http://localhost:5000/v0/lab || exit 1


ENTRYPOINT ["/src/iblapi/run-ibl-api.prod.sh"]

# for production builds
COPY ["./*.txt", "./*.sh", "./*.rst", "./*.py", "/src/iblapi/"]
COPY ["notebooks", "/src/iblapi/notebooks"]

RUN \
    pip install -e /src/iblapi && \
    chmod +x /src/iblapi/run-ibl-api.prod.sh && \
    chmod +x /src/iblapi/run-ibl-api.dev.sh

COPY ["tests", "/src/iblapi/tests"]