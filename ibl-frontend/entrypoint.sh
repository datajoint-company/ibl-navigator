#! /bin/bash

# sed -i "s|\$PROD_NODE_API|${PROD_NODE_API}|g" $(ls /frontend/dist/pipeline-viewer/main.*)
sed -i "s|\$PROD_NODE_BACKEND|${PROD_NODE_BACKEND}|g" $(ls /frontend/dist/pipeline-viewer/main.*)

# sed -i "s|\$PROD_NODE_API|${PROD_NODE_API}|g" /frontend/src/environments/environment.prod.ts
sed -i "s|\$PROD_NODE_BACKEND|${PROD_NODE_BACKEND}|g" /frontend/src/environments/environment.prod.ts

"$@"