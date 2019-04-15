# PipelineViewer

This is a website to view the IBL pipelines

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `node server.js` (in the old backend API) 

## Docker Environment

Copy docker-compose-template.yml to docker-compose.yml, adjust to taste.

Services:

  - iblapi: port 5000
    runs backend/iblapi.py
    expects dj_local_conf.json in project root.
  - iblapi-dj: port 8000 
    serves jupyterlab
  - ibl-navigator: port 4200
    runs ibl-navigator / node

