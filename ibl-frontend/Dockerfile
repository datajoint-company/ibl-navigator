# FROM vathes/angulardev:angcli7.1.4-angbuild0.11.4

FROM node:12-bullseye

RUN \
    apt update && \
    apt install nginx -y

WORKDIR /app/dist/pipeline-viewer

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

COPY ./app.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]

ADD ./frontend-content/package.json /app/

RUN \
    cd /app && \
    npm install 

ADD ./frontend-content /app

COPY ./frontend-content/src/assets/addons/indigo-pink-ibl.css /app/node_modules/\@angular/material/prebuilt-themes/
COPY ./frontend-content/src/assets/addons/plotly.js /app/node_modules/plotly.js-dist/

RUN \
    cd /app && \
    node --max_old_space_size=5120 /app/node_modules/@angular/cli/bin/ng build --configuration production


# CMD ["http-server","-p", "8080" ,"-a","0.0.0.0"]
# CMD ["ng","serve","--host","0.0.0.0","--port","8080"]
# CMD tail -f /dev/null
















# RUN \
#   mkdir -p /app/node_modules && \
#   apt-get update && \
#   npm install -g @angular/cli > /dev/null && \
#   # npm install -g typescript@3.5.3 && \
#   # npm install -g @angular-devkit/schematics > /dev/null && \
#   # npm install -g --only=dev @angular-devkit/build-angular > /dev/null && \
#   npm install -g http-server && \
#   npm install -g typescript && \
#   # && \
#   # ng update
#   # && \
#   cd /app && \
#   npm install --save-dev @angular-devkit/build-angular > /dev/null 
#   # && \
#   # ng update 
#   # && \
#   # npm update

# CMD ["nginx", "-g", "daemon off;"]
# # VOLUME /app/node_modules
# # --------

# COPY ./app.conf /etc/nginx/conf.d/default.conf

# COPY ./entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh
# ENTRYPOINT ["/entrypoint.sh"]



# COPY ./frontend-content /app

# # RUN \
# #     cd /app && \
# #     npm install -g @angular/cli > /dev/null && \
# #     npm install --save-dev @angular-devkit/build-angular > /dev/null

# COPY ./frontend-content/src/assets/addons/indigo-pink-ibl.css /app/node_modules/\@angular/material/prebuilt-themes/
# COPY ./frontend-content/src/assets/addons/plotly.js /app/node_modules/plotly.js-dist/

# WORKDIR /app/dist/pipeline-viewer

# RUN \
#     cd /app && \
#     ng build --prod

# # RUN npm install http-server -g


# # WORKDIR /app



# # CMD ["http-server","-p", "9000" ,"-a","0.0.0.0"]
# # CMD ["ng","serve","--host","0.0.0.0","--port","9000"]
# # CMD tail -f /dev/null