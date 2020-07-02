From nginx:1.17.2

RUN groupadd --gid 1000 node \
  && useradd --uid 1000 --gid node --shell /bin/bash --create-home node

ENV NODE_VERSION 10.16.0

RUN buildDeps='xz-utils' \
    && ARCH= && dpkgArch="$(dpkg --print-architecture)" \
    && case "${dpkgArch##*-}" in \
      amd64) ARCH='x64';; \
      ppc64el) ARCH='ppc64le';; \
      s390x) ARCH='s390x';; \
      arm64) ARCH='arm64';; \
      armhf) ARCH='armv7l';; \
      i386) ARCH='x86';; \
      *) echo "unsupported architecture"; exit 1 ;; \
    esac \
    && set -ex \
    && apt-get update && apt-get install -y ca-certificates curl wget gnupg dirmngr $buildDeps --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && for key in \
      94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
      FD3A5288F042B6850C66B31F09FE44734EB7990E \
      71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
      DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
      C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
      B9AE9905FFD7803F25714661B63B535A4C206CA9 \
      77984A986EBC2AA786BC0F66B01FBB92821C587A \
      8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
      4ED778F539E3634C779C87C6D7062848A1AB005C \
      A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
      B9E2F5981AA6E0CD28160D9FF13993A75599653C \
    ; do \
      gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
      gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
      gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
    done \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
    && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
    && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
    && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
    && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
    && apt-get purge -y --auto-remove $buildDeps \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

ENV YARN_VERSION 1.16.0

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" || \
    gpg --batch --keyserver hkp://ipv4.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --batch --keyserver hkp://pgp.mit.edu:80 --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz

# COPY docker-entrypoint.sh /usr/local/bin/
# ENTRYPOINT ["docker-entrypoint.sh"]

# CMD [ "node" ]

#######
RUN \
  # id && \
  mkdir -p /app/node_modules && \
  apt-get update && \
  # apt-get install software-properties-common -y && \
  # add-apt-repository ppa:deadsnakes/ppa && \
  # apt-get update && \
  # apt-get install python -y && \
  npm install --unsafe-perm -g @angular/cli > /dev/null && \
  npm install --unsafe-perm -g http-server 

CMD ["ng","serve","--host","0.0.0.0","--port","9000","--disable-host-check"]

# RUN \
#   cd /app && \
#   npm install --unsafe-perm -g \
#     @angular-devkit/architect@~0.11.0 \
#     @angular-devkit/build-angular@~0.11.0 \
#     @angular-devkit/build-optimizer@~0.11.0 \
#     @angular-devkit/build-webpack@~0.11.0 \
#     @angular-devkit/core@~7.1.0 \
#     @angular-devkit/schematics@~7.1.0 \
#     @angular/animations@~7.1.0 \
#     @angular/cdk@7.3.0 \
#     @angular/cli@~7.1.3 \
#     @angular/common@~7.1.3 \
#     @angular/compiler-cli@~7.1.0 \
#     @angular/language-service@~7.1.0 \
#     @angular/animations@^7.1.4 \
#     @angular/cdk@^7.3.7 \
#     @angular/common@~7.1.0 \
#     @angular/compiler@~7.1.0 \
#     @angular/core@~7.1.0 \
#     @angular/flex-layout@^7.0.0-beta.24 \
#     @angular/forms@~7.1.0 \
#     @angular/language-service@~7.1.0 \
#     @angular/material@^7.3.3 \
#     @angular/material-moment-adapter@^8.1.2 \
#     @angular/platform-browser@~7.1.0 \
#     @angular/platform-browser-dynamic@~7.1.0 \
#     @angular/router@~7.1.0 \
#     webpack@~4.23.0 \
#     webpack-dev-server@~3.1.0 \
#     typescript@~3.1.0 \
#     rxjs@~6.3.0
# RUN \
#   npm install --unsafe-perm -g \
#     @ngtools/webpack@~7.1.0
# RUN \
#   cd /app && \
#   npm install --unsafe-perm --save \ 
#     @ngtools/webpack@~7.1.0 \
#     postcss-loader@~3.0.0 \
#     bootstrap@~4.2.1 \
#     @angular-devkit/build-optimizer@~0.11.0 \
#     @angular/cli@~7.1.3 \
#     @angular-devkit/build-angular@~0.11.0 \
#     @angular/core@~7.1.0 \
#     typescript@~3.1.0
    # \
    # webpack-loader@0.0.0
  #   && \
  # npm install --save \
  #   @angular/core@~7.1.0


  # npm install --save-dev @angular-devkit/build-angular@0.11.4 @angular-devkit/architect@0.11.4 @angular-devkit/build-optimizer@0.11.4 @angular-devkit/build-webpack@0.11.4 @angular-devkit/core@7.1.4 @ngtools/webpack@7.1.4 ajv@6.5.3 autoprefixer@9.3.1 circular-dependency-plugin@5.0.2 clean-css@4.2.1 copy-webpack-plugin@4.5.4 file-loader@2.0.0 glob@7.1.3 istanbul@0.4.5 istanbul-instrumenter-loader@3.0.1 karma-source-map-support@1.3.0 less@3.8.1 less-loader@4.1.0 license-webpack-plugin@2.0.2 loader-utils@1.1.0 mini-css-extract-plugin@0.4.4 minimatch@3.0.4 node-sass@4.10.0 opn@5.3.0 parse5@4.0.0 portfinder@1.0.17 postcss@7.0.5 postcss-import@12.0.0 postcss-loader@3.0.0 raw-loader@0.5.1 rxjs@6.3.3 sass-loader@7.1.0 semver@5.5.1 source-map-loader@0.2.4 source-map-support@0.5.9 speed-measure-webpack-plugin@1.2.3 stats-webpack-plugin@0.7.0 style-loader@0.23.1 stylus@0.54.5 stylus-loader@3.0.2 terser-webpack-plugin@1.1.0 tree-kill@1.2.0 webpack@4.23.1 webpack-dev-middleware@3.4.0 webpack-dev-server@3.1.10 webpack-merge@4.1.4 webpack-sources@1.3.0 webpack-subresource-integrity@1.1.0-rc.6 > /dev/null

# RUN \
#   cd /app && \
#   npm install --save-dev @angular-devkit/build-angular@~0.11.0 > /dev/null && \
#   npm install --save-dev @angular/platform-browser@~7.1.0 > /dev/null && \
#   npm install --save-dev @angular/platform-browser-dynamic@~7.1.0 > /dev/null

# -------------------

WORKDIR /app/dist/pipeline-viewer
# WORKDIR /app

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

COPY ./app.conf /etc/nginx/conf.d/default.conf
CMD ["nginx", "-g", "daemon off;"]

ADD ./frontend-content/package.json /app/
ADD ./frontend-content/package-lock.json /app/
RUN \
    cd /app && \
    npm install --save-dev @angular-devkit/build-angular > /dev/null


ADD ./frontend-content /app

COPY ./frontend-content/src/assets/addons/indigo-pink-ibl.css /app/node_modules/\@angular/material/prebuilt-themes/
COPY ./frontend-content/src/assets/addons/plotly.js /app/node_modules/plotly.js-dist/

RUN \
    cd /app && \
    ng build --prod




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