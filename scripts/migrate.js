const Cloudant = require('cloudant');
const async = require('async');
const cloudant = Cloudant({url: process.env.COUCH_HOST});
const olddb = cloudant.db.use(process.env.OLD_DB);
const newdb = cloudant.db.use(process.env.NEW_DB);
const old_user_id = process.env.OLD_USER_ID;
const new_user_id = process.env.NEW_USER_ID;


const move = function(skip, callback) {
  olddb.list({skip: skip, limit: 100, include_docs:true}, function(err, data) {
    if (data && data.rows.length == 0) {
      return callback(null, true)
    } 
    if (err) {
      return callback(err, false);
    }

    var buffer = [];

    for(var i in data.rows) {
      var doc = data.rows[i].doc;
      if (typeof doc.userid ==='string') {
        if (doc.userid == old_user_id) {
          doc.userid = new_user_id;
          doc._id = doc._id.split('-').slice(1).join('-');
          delete doc._rev;

          // if this is an event, make a new expense doc and remove
          // expenses from this doc
          if (doc.collection === 'event') {
            var newdoc = {
              collection: 'expense',
              title: doc.title,
              event: doc._id,
              dtstart: doc.dtstart,
              comments: doc.comments,
              travel_expenses_currency: doc.travel_expenses_currency,
              travel_expenses: doc.travel_expenses,
              non_travel_expenses_currency: doc.non_travel_expenses_currency,
              non_travel_expenses: doc.non_travel_expenses,
              userid: doc.userid,
              userDisplayName: doc.userDisplayName,
              teamid: doc.teamid,
              ts: doc.ts
            };
            delete doc.travel_expenses_currency;
            delete doc.travel_expenses;
            delete doc.non_travel_expenses_currency;
            delete doc.non_travel_expenses;
            //console.log('new doc', newdoc);
            buffer.push(newdoc);
          }
          buffer.push(doc);
          //console.log('found doc', doc);
        }
      }
    }

    if (buffer.length >0) {
      console.log('Writing', buffer.length, 'docs')
      newdb.bulk({docs: buffer}, function(err, data) {
        callback(null, false);
      });
    } else {
      console.log('nothing to do');
      callback(null, false);
    }
   
  });
}

var breakout = false;
var skip = 0;
async.doUntil(function(done) {
  move(skip, function(err, data) {
    skip += 100;
    breakout = data;
    done();
  });
}, function() {
  return breakout;
}, function() {
  console.log('done')
});