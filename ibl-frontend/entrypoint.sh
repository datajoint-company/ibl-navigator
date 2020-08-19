#! /bin/bash

# sed -i "s|\$PROD_NODE_API|${PROD_NODE_API}|g" $(ls /app/dist/pipeline-viewer/main.*)
sed -i "s|\$PROD_NODE_BACKEND|${PROD_NODE_BACKEND}|g" $(ls /app/dist/pipeline-viewer/main.*)

# sed -i "s|\$PROD_NODE_API|${PROD_NODE_API}|g" /app/src/environments/environment.prod.ts
sed -i "s|\$PROD_NODE_BACKEND|${PROD_NODE_BACKEND}|g" /app/src/environments/environment.prod.ts

# sed -i "s|\$DEV_NODE_API|${DEV_NODE_API}|g" /app/src/environments/environment.ts
sed -i "s|\$DEV_NODE_BACKEND|${DEV_NODE_BACKEND}|g" /app/src/environments/environment.ts

"$@"