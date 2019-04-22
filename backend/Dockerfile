FROM datajoint/jupyter:python3.6

# for production builds
# ADD . /src/iblapi

RUN pip uninstall -y datajoint && pip install git+https://github.com/dimitri-yatsenko/datajoint-python.git@dj0#egg=datajoint-python

RUN pip install -e /src/iblapi

