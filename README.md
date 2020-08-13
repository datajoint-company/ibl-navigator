## How to build and develop using the new dockerized app.

### Prerequisites

If not already satisfied, add the following entry into your `/etc/hosts` file at the very top:

```
127.0.0.1       fakeservices.datajoint.io
```

This will create an alias to your `localhost` based on requests to `fakeservices.datajoint.io`.

Make sure to also define a `.env` file as follows:

``` sh
# minimum
DJ_PASS=db_password
AWS_ACCESS_KEY_ID=aws_key
AWS_SECRET_ACCESS_KEY=aws_secret
DEMO_PASSWORD=ibl_navigator_password
JWT_SECRET=secret
# utilized for remote deployment
SUBDOMAINS=sub
URL=example.com
# utilized for load testing
TEST_DJ_HOST=test_db_host
TEST_DJ_USER=test_db_user
TEST_DJ_PASS=test_db_password
```

### Versioning

Versioning is now handled in `version.env`. Make sure to increment the version as appropriate to service based on [semantic versioning](https://semver.org/) guidelines. For services specific to `public` development, version should indicate as such e.g. `vX.X.X-public`. To determine the global version for git tagging, utilize a vector summation between python backend, node backend, frontend, and nginx. If related to `public` development, make sure to additionally add the `-public` suffix. Additionally, version can be inspected within node backend by sending a request to `/version`. To properly handle versioning both for image tags and api requests, you will need to prepend your `docker-compose` commands with `env $(grep -hv '^#' version.env) `.

### Build

To be 100% sure of the new build to be reflected - use below
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml build --no-cache`

Then,
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml up`
to begin the development in `ng serve` mode - go to
fakeservices.datajoint.io:9000 to see the site.
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml down`
when done developing. **Note: When utilizing `dev` and `test` docker-compose files, `ibl-frontend/frontend-content/src/environments/*.ts` files are overwritten due to volume mount. Make sure not to commit these updates.**

For casual re-build/up process
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml up --build`

For detached mode and to add log after the fact
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml up -d`
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml logs -f`

to do the regular docker-compose up then go to localhost:9000
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-build.yml up --build`

to check inside docker 
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-dev.yml exec ibl-node-server /bin/bash`

--------------------------------
for deploy (general)

`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-build.yml build ibl-navigator` once that's built,
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-build.yml push ibl-navigator`

repeat for other 2 `iblapi` `ibl-node-server` and push to appropriate directory. Update the tags accordingly as well.

for testdev deploy
comment out test/* directory in `.dockerignore` (until proper storage solution is in place)

make sure to update `SUBDOMAINS` key in `.env` file to `testdev`.
make sure to update `URL` key in `.env` file to `datajoint.io`.

for test dev mode, in `docker-compose-deploy.yml` make sure `STAGING=true` for `letsencrypt` > environment setting.

`ssh testdev` go to `ibl-navigator`
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml down` to stop what's already running
`sudo rm -R letsencrypt-keys` to get rid of key folder that generated in the previous run.
`git pull origin dev` to get the latest from `vathes/ibl-navigator` repo.
make sure to move over to the `dev` branch by `git checkout dev`
`docker login registry.vathes.com` to docker to get access.
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml pull` to get the ibl-navigator container
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml up -d`

-----------------------------------

for real deploy

make sure to update `SUBDOMAINS` key in `.env` file to `djcompute`.
make sure to update `URL` key in `.env` file to `internationalbrainlab.org`.

for client deploy mode, in `docker-compose-deploy.yml` make sure to comment out `STAGING=true` for `letsencrypt` > environment setting.

`ssh djcompute` go to `nagivator-deployer/ibl-navigator`
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml down` to stop what's already running
`git pull origin master` to get the latest from `vathes/ibl-navigator` repo.
make sure to move over to the `master` branch by `git checkout master`
`docker login registry.vathes.com` to docker to get access.
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml pull` to get the ibl-navigator container
`env $(grep -hv '^#' version.env) docker-compose -f docker-compose-deploy.yml up -d`

-------------------------------------