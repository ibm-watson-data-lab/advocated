// create index for only 'event' docs keyed on [user_id, dstart]
var userEvents = function(doc) {
  if (doc.collection == 'event') {
    emit([doc.user_id, doc.dtstart], doc.title);
  }
};

// create index for any doc keyed on [user_id, dstart]
var userDocs = function(doc) {
  emit([doc.user_id, doc.dtstart], doc.title);
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
  }
};