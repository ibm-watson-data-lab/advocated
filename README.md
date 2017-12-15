

## Replication

To replicate just the blogs from the main database to a `blogs` database, you can create a document in the `_replicator` database like this:

```
{
  "_id": "blogs",
  "source": "https://USER@PASS@HOST.cloudant.com/advocated3",
  "target": "https://USER@PASS@HOST.cloudant.com/blogs",
  "continuous": true,
  "filter": "report/bycollection",
  "query_params": {
    "collection": "blog"
  }
}
```