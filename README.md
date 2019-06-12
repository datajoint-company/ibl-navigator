# PipelineViewer

This is a website to view the IBL pipelines

## Development server

To run the front end  - 
Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

To run the backend proxy server - 
`cd backend` and move inside `backend` folder.
Run `node server.js` 

To run the ibl api server -
refer to the `README` inside the `backend` folder

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

