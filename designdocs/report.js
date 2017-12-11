var userEvents = function(doc) {
  if (doc.collection == 'event') {
    emit([doc.user_id, doc.dtstart], doc.title);
  }
};

module.exports = {
  _id: "_design/report",
  views: {
    userevents: {
      map: userEvents.toString(),
      reduce: "_count"
    }
  }
};