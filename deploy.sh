#!/bin/bash

if [ -z "$COUCH_HOST" ]; then echo "COUCH_HOST is required"; exit 1; fi
if [ -z "$COUCH_DATABASE" ]; then echo "COUCH_DATABASE is required"; exit 1; fi
if [ -z "$SLACK_TOKEN" ]; then echo "SLACK_TOKEN is required"; exit 1; fi
if [ -z "$APP_URL" ]; then echo "APP_URL is required"; exit 1; fi

## design documents
export COUCH_URL="$COUCH_HOST"
couchmigrate --dd ./designdocs/report.js --db "$COUCH_DATABASE"

# deploy to OpenWhisk
bx wsk package update advocated --param COUCH_HOST $COUCH_HOST --param COUCH_DATABASE $COUCH_DATABASE --param SLACK_TOKEN $SLACK_TOKEN --param APP_URL $APP_URL

# create actions
cd actions
ls *.js | tr '\n' '\0' | xargs -0 -n1 ./deploy_action.sh
cd ..

# create API
bx wsk api create /advocated /login post advocated/login --response-type http
bx wsk api create /advocated /verify post advocated/verify --response-type http
bx wsk api create /advocated /submit post advocated/submit --response-type http
bx wsk api create /advocated /userevents post advocated/userevents --response-type http

