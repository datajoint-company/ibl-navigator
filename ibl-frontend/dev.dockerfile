# don't build
FROM vathes/angulardev:angcli7.1.4-angbuild0.11.4
# RUN \ 
#     npm cache clean -f && \
#     npm install -g n && \
#     n 12.14.0

#RUN id && npm install -g node@^12.0.0

HEALTHCHECK       \
    --timeout=3s \ 
    --retries=20  \
    CMD           \
        curl --fail http://localhost:9000 || exit 1

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["ng","serve","--host","0.0.0.0","--port","9000","--disable-host-check"]

WORKDIR /app

ADD ./frontend-content/package.json /app/
ADD ./frontend-content/package-lock.json /app/
RUN \
    npm install && \
    npm install --only=dev
ADD ./frontend-content /app

COPY ./frontend-content/src/assets/addons/indigo-pink-ibl.css /app/node_modules/\@angular/material/prebuilt-themes/
COPY ./frontend-content/src/assets/addons/plotly.js /app/node_modules/plotly.js-dist/



