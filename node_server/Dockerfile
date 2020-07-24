FROM node:10.16-slim

RUN \
    apt-get update && \
    apt-get install git -y && \
    mkdir /src && \
    mkdir /src/middleware

COPY ./package.json /src/

RUN \
    cd /src && \
    npm install

# RUN npm install -g nodemon

# COPY ./* /src/
COPY ./ /src/

# RUN \
#     mv /src/check-auth.js /src/middleware/

CMD node --max_old_space_size=8192 /src/server.js
# CMD nodemon /src/server.js
# CMD tail -f /dev/null