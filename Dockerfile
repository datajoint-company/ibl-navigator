
FROM datajoint/jupyter:python3.6

RUN curl -sL https://deb.nodesource.com/setup_11.x | bash - && apt-get update

RUN apt-get install -y nodejs build-essential

# for production builds:
# ADD . /src/ibl-navigator

EXPOSE 4200
ENTRYPOINT ["/src/ibl-navigator/ibl-navigator"]
CMD [""]
