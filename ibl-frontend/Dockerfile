FROM node:10.16-slim

COPY . /frontend

RUN \
    cd /frontend && \
    npm install -g @angular/cli && \
    npm install --save-dev @angular-devkit/build-angular

COPY ./src/assets/addons/indigo-pink-ibl.css /frontend/node_modules/\@angular/material/prebuilt-themes/
COPY ./src/assets/addons/plotly.js /frontend/node_modules/plotly.js-dist/

RUN \
    cd /frontend && \
    ng build --prod

RUN npm install http-server -g

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail http://localhost:8080 || exit 1

WORKDIR /frontend/dist/pipeline-viewer
# WORKDIR /frontend

CMD ["http-server","-p", "8080" ,"-a","0.0.0.0"]
# CMD ["ng","serve","--host","0.0.0.0","--port","8080"]
# CMD tail -f /dev/null





