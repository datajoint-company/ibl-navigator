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
API_MODE=[public | private]
# utilized for remote deployment
SUBDOMAINS=sub
URL=example.com
# utilized for load testing
TEST_DJ_HOST=test_db_host
TEST_DJ_USER=test_db_user
TEST_DJ_PASS=test_db_password
```

### Build

When building in local/dev mode, make sure to not commit the changes in the frontend/src/environment folder - especially the part where backend_url gets overwritten by the fakeservices.datajoint.io url.

To be 100% sure of the new build to be reflected - use below
`docker-compose -f docker-compose-dev.yml build --no-cache`

Then,
`docker-compose -f docker-compose-dev.yml up`
to begin the development in `ng serve` mode - go to
fakeservices.datajoint.io:9000 to see the site.
`docker-compose -f docker-compose-dev.yml down`
when done developing.

For casual re-build/up process
`docker-compose -f docker-compose-dev.yml up --build`

For detached mode and to add log after the fact
`docker-compose -f docker-compose-dev.yml up -d`
`docker-compose -f docker-compose-dev.yml logs -f`

**To see the production build using `ng build --prod`, make sure to increment the `vX.X.X` portion of the image tag and if it relates to public site add `-public` at the end.**

to do the regular docker-compose up then go to localhost:9000
`docker-compose -f docker-compose-build.yml up --build`

to check inside docker 
`docker-compose -f docker-compose-dev.yml exec ibl-node-server /bin/bash`

--------------------------------
for deploy (general)

`docker-compose -f docker-compose-build.yml build ibl-navigator` once that's built,
`docker-compose -f docker-compose-build.yml push ibl-navigator`

repeat for other 2 `iblapi` `ibl-node-server` and push to appropriate directory. Update the tags accordingly as well.

for testdev deploy
comment out test/* directory in `.dockerignore` (until proper storage solution is in place)

make sure to update `SUBDOMAINS` key in `.env` file to `testdev`.
make sure to update `URL` key in `.env` file to `datajoint.io`.

for test dev mode, in `docker-compose-deploy.yml` make sure `STAGING=true` for `letsencrypt` > environment setting.

`ssh testdev` go to `ibl-navigator`
`docker-compose -f docker-compose-deploy.yml down` to stop what's already running
`sudo rm -R letsencrypt-keys` to get rid of key folder that generated in the previous run.

`git pull https://github.com/vathes/ibl-navigator.git dev` to get the latest from `vathes/ibl-navigator` repo.
NOTE: to make sure branch is freshly deployed, `git checkout remote/branch` is recommended. 
`origin` should be pointed to `https://github.com/vathes/ibl-navigator.git` in the testdev EC2 but do double check.

login with your regular github credentials (the one registered under github vathes)
make sure to move over to the `dev` branch by `git checkout dev`
`docker login registry.vathes.com` to docker to get access.
`docker-compose -f docker-compose-deploy.yml pull` to get the ibl-navigator container
`docker-compose -f docker-compose-deploy.yml up -d`

-----------------------------------

for real deploy

make sure to update `SUBDOMAINS` key in `.env` file to `djcompute`.
make sure to update `URL` key in `.env` file to `internationalbrainlab.org`.

for client deploy mode, in `docker-compose-deploy.yml` make sure to comment out `STAGING=true` for `letsencrypt` > environment setting.

`ssh djcompute` go to `nagivator-deployer/ibl-navigator`
`docker-compose -f docker-compose-deploy.yml down` to stop what's already running

`git pull https://github.com/vathes/ibl-navigator.git master` to get the latest from `vathes/ibl-navigator` repo.
NOTE: to make sure branch is freshly deployed, `git checkout remote/branch` is recommended. Do check which remote is pointing to which repo before checking a branch out.

login with your regular github credentials (the one registered under github vathes)
make sure to move over to the `master` branch by `git checkout master`
`docker login registry.vathes.com` to docker to get access.
`docker-compose -f docker-compose-deploy.yml pull` to get the ibl-navigator container
`docker-compose -f docker-compose-deploy.yml up -d`

-------------------------------------
