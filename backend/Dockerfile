FROM datajoint/jupyter:python3.6

# for production builds
ADD . /src/iblapi

#RUN pip uninstall -y datajoint && pip install git+https://github.com/dimitri-yatsenko/datajoint-python.git@dev#egg=datajoint-python

RUN pip install --upgrade --pre datajoint

RUN pip install -e /src/iblapi

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail http://localhost:5000/v0/lab || exit 1


# RUN \ # from public demo branch - goes in place of line 10
#     pip install -e /src/iblapi && \
#     chmod +x /src/iblapi/run-ibl-api.prod.sh && \
#     chmod +x /src/iblapi/run-ibl-api.dev.sh

# ENTRYPOINT ["/src/iblapi/run-ibl-api.prod.sh"]