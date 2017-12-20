#!/bin/bash

if [ -z "$COUCH_HOST" ]; then echo "COUCH_HOST is required"; exit 1; fi
if [ -z "$COUCH_DATABASE" ]; then echo "COUCH_DATABASE is required"; exit 1; fi
if [ -z "$SLACK_WEBHOOK_URL"]; then echo "SLACK_WEBHOOK_URL is required"; exit 1; fi

## design documents
export COUCH_URL="$COUCH_HOST"
couchmigrate --dd ./designdocs/report.js --db "$COUCH_DATABASE"

# deploy to OpenWhisk
bx wsk package update advocated --param COUCH_HOST $COUCH_HOST --param COUCH_DATABASE $COUCH_DATABASE --param SLACK_WEBHOOK_URL $SLACK_WEBHOOK_URL

# create actions
cd actions
ls *.js | tr '\n' '\0' | xargs -0 -n1 ./deploy_action.sh
cd ..

# create API
bx wsk api create /advocated /verify post advocated/verify --response-type http
bx wsk api create /advocated /submit post advocated/submit --response-type http
bx wsk api create /advocated /userevents post advocated/userevents --response-type http
bx wsk api create /advocated /userdocs post advocated/userdocs --response-type http
bx wsk api create /advocated /getbyid post advocated/getbyid --response-type http
bx wsk api create /advocated /deletebyid post advocated/deletebyid --response-type http

# create changes feed listener
# split out components of URL
export HOSTNAME=`./urlparse.js $COUCH_HOST host`
export USERNAME=`./urlparse.js $COUCH_HOST username`
export PASSWORD=`./urlparse.js $COUCH_HOST password`
# create a Cloudant connection
bx wsk package bind /whisk.system/cloudant advocatedCloudant -p username "$USERNAME" -p password "$PASSWORD" -p host "$HOSTNAME"
# a trigger that listens to our database's changes feed
bx wsk trigger create advocatedTrigger --feed /_/advocatedCloudant/changes --param dbname "$COUCH_DATABASE" 
# a rule to call our action when the trigger is fired
bx wsk rule create advocatedRule advocatedTrigger advocated/onchange
