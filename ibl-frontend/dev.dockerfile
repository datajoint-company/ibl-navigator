# don't build
FROM node:10.16-slim

RUN \
    mkdir -p /app/node_modules && \
    apt-get update && \
    npm install -g @angular/cli > /dev/null 
    # && \
    # npm install -g @angular-devkit/build-angular > /dev/null && \
    # npm install -g http-server
# VOLUME /app/node_modules
CMD ["ng","serve","--host","0.0.0.0","--port","9000","--disable-host-check"]
# ----------------------

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail http://localhost:9000 || exit 1


WORKDIR /app



ADD ./frontend-content/package.json /app/
RUN \
    npm install && \
    npm install --only=dev
ADD ./frontend-content /app

COPY ./frontend-content/src/assets/addons/indigo-pink-ibl.css /app/node_modules/\@angular/material/prebuilt-themes/
COPY ./frontend-content/src/assets/addons/plotly.js /app/node_modules/plotly.js-dist/



