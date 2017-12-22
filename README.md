
# /advocated

This is the IBM Watson Data platform developer advocacy reporting tool. It records events, presentations, blogs and expenditure that the team makes in a Cloudant database.

It consists of the following components:

- a web front end hosted on Github pages - no servers required
- a set of serverless actions that form an API, hosted on IBM Cloud Functions (OpenWhisk)
- a Cloudant database

## Deployment

You need to create two databases in your Cloudant service:

1) to store the advocacy stats, say `advocated`
2) to store the session tokens that allow users to be logged in, say `tokens`

Create these empty databases in the Cloudant dashboard.

Knowing the URL of your Cloudant service and the name of the database to use, set the following environment variables:

```
export COUCH_HOST="https://USER:PASS@host.cloudant.com"
export COUCH_DATABASE="advocated"
```

Then run the deployment script to create the serverless actions. 

    ./deploy.sh

You need your `bx wsk` tool to be installed and authenticated against the locale, org and space you wish to deploy to.

Make a note of the URL where your actions are served out as an API.

## Configuration

The API of your serverless application is configured at the top of `js/lib.js`.

## Web application

The contents of the `gh-pages` branch are served out automatically at https://ibm-watson-data-lab.github.io/advocated.

## Logging in

You need to be invited to use this app. This involves creating a document in the `tokens` database of this form.

```
{
  "_id": "c8d4ecc06ca25f48bcb53391a4cd1a15",    <-- auto generated
  "teamid": "wdpdevadv",                        <-- constant
  "userid": "glynn.bird@uk.ibm.com",            <-- the email address of the user to invite
  "userDisplayName": "glynn.bird"               <-- the display name of the user to invite.
}
```

e.g cut-n-paste this bit below the auto-generated _id in the Cloudant dashboards

```
  "teamid": "wdpdevadv",                       
  "userid": "glynn.bird@uk.ibm.com",          
  "userDisplayName": "glynn.bird" 
```

## Replication

To replicate just the blogs from the main database to a `blogs` database, you can create a document in the `_replicator` database like this:

```
{
  "_id": "blogs",
  "source": "https://USER@PASS@HOST.cloudant.com/advocated",
  "target": "https://USER@PASS@HOST.cloudant.com/blogs",
  "continuous": true,
  "filter": "report/bycollection",
  "query_params": {
    "collection": "blog"
  }
}
```

This initiates a continuous replication job from the `advocated` database to the `blogs` database, only including documents that belong to the `blog` collection.
