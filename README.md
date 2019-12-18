## How to build and develop using the new dockerrized app.

To be 100% sure of the new build to be reflected - use below
`docker-compose -f docker-compose-dev.yml build --no-cache`

Then,
`docker-compose -f docker-compose-dev.yml up`
to begin the development in `ng serve` mode - go to
localhost:9000 to see the site.
`docker-compose -f docker-compose-dev.yml down`
when done developing.

For casual re-build/up process
`docker-compose -f docker-compose-dev.yml up --build`

For detached mode and to add log after the fact
`docker-compose -f docker-compose-dev.yml up -d`
`docker-compose -f docker-compose-dev.yml logs -f`

To see the production build using `ng build --prod`,
do the regular docker-compose up then go to localhost:8080
`docker-compose up --build`

to check inside docker 
`docker-compose -f docker-compose-dev.yml exec ibl-node-server /bin/bash`

--------------------------------
for deploy (general)

Before building, make sure `build: ./ibl-frontend` is UNcommented in docker-compose.yml.
`docker-compose build ibl-navigator` once that's built,
`docker push registry.vathes.com/ibl-navigator/frontend:v0.0`

commentout the `build: ./ibl-frontend`

repeat for other 3 `iblapi` `ibl-node-server` `nginx` and push to appropriate directory. Update the tags accordingly as well.

for testdev deploy
comment out test/* directory in `.dockerignore` (until proper storage solution is in place)
for test dev mode, make sure `STAGING=true` for nginx > environment setting.

`ssh testdev` go to `ibl-navigator`
`docker-compose down` to stop what's already running
`sudo rm -R letsencrypt-keys` to get rid of key folder that generated in the previous run.
`git pull origin dev` to get the latest from `mahos/ibl-navigator` repo.
make sure to move over to the `dev` branch by `git checkout dev`
`docker login registry.vathes.com` to docker to get access.
`docker-compose pull` to get the ibl-navigator container
`docker-compose up --build -d`

-----------------------------------

for real deploy
for client deploy mode, comment out `STAGING=true` for nginx > environment setting.

`ssh djcompute` go to `nagivator-deployer/ibl-navigator`
`docker-compose down` to stop what's already running
`git pull origin master` to get the latest from `mahos/ibl-navigator` repo.
make sure to move over to the `master` branch by `git checkout master`
`docker login registry.vathes.com` to docker to get access.
`docker-compose pull` to get the ibl-navigator container
`docker-compose up --build -d`

-------------------------------------