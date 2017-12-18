// create index for only 'event' docs keyed on [user_id, dstart]
var userEvents = function(doc) {
  if (doc.collection == 'event') {
    emit([doc.userid, doc.dtstart], doc.title);
  }
};

// create index for any doc keyed on [user_id, dstart]
var userDocs = function(doc) {
  emit([doc.userid, doc.dtstart], doc.title);
};

// this function is purely for filtered replication
// It allows continuous replication from the core database to 
// other secondary databases that only contain one collection.
var bycollection = function(doc, req) {
  return (doc.collection === req.query.collection);
};

module.exports = {
  _id: "_design/report",
  views: {
    userevents: {
      map: userEvents.toString(),
      reduce: "_count"
    },
    userdocs: {
      map: userDocs.toString(),
      reduce: "_count"
    }
  },
  filters: {
    bycollection: bycollection.toString()
  }
};