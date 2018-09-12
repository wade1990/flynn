#!/bin/bash

set -e

cp -R dashboardv2 /app

cd /app
npm install --unsafe-perm=true # unsafe-perm is required for node-sass to install
npm run build

cd /
go-bindata -nomemcopy -nocompress -pkg "main" /app/build/...
