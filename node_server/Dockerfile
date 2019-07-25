FROM node:10.16-slim

RUN \
    mkdir /src && \
    mkdir /src/middleware

COPY ./* /src/

RUN \
    mv /src/check-auth.js /src/middleware/ && \
    cd /src && \
    npm install

CMD node /src/server.js
# CMD tail -f /dev/null