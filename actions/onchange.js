const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');
const request = require('request');

var slackpost = function(webhook, obj) {

  var str = "";
  if (obj.collection == "session") {
    str += 'Hey! *' + obj.userDisplayName + '* just `/advocated` with a presentation ';
    str += '*' + obj.title + '*';
    if (!isNaN(obj.attendees)) {
      str += ' to ' + obj.attendees + ' people.';
    }
  } else if (obj.collection == "event") {
    str += "Hey! *" + obj.userDisplayName + "* just `/advocated` at ";
    str += '*' + obj.title + '*';
    if (!isNaN(obj.attendees)) {
      str += ' with ' + obj.attendees + ' people.';
    }
  } else if (obj.collection == "blog") {
    str += "Hey! *" + obj.userDisplayName + "* just `/advocated` with a blog ";
    str += '*' + obj.title + '* --> ' + obj.url;
  } else if (obj.collection == "press") {
    str += "Hey! *" + obj.userDisplayName + "* just `/advocated` with the press @ *" + obj.outlet + "*";
    str += ' about *' + obj.title + '*';
    if (obj.url) {
      str += ' --> ' + obj.url;
    }
  }
  console.log('!!!!',str,'!!!!!');

  return new Promise(function(resolve, reject) {
    if (str.length > 0) {
      var opts = {
        method: 'post',
        url: webhook,
        form: {
          payload: JSON.stringify({
            text: str
          })
        },
        json: true
      };
  
      request(opts, function (error, response, body) {
        resolve(body);
      });

    } else {
      reject(null);
    }
  });
};


const main = function(msg) {
  
  // cloudant
 const db = cloudant.configure(msg.COUCH_HOST, msg.COUCH_DATABASE);
  
  // deal with the incoming change as long as it's a first change
  if (msg.id && msg.changes && msg.changes[0].rev.match(/^1\-/)) {

    console.log('we have a new record', msg.id);
    // load cookie data
    return db.get(msg.id).then(function(data) {
      if (data.collection !== 'expense') {
        return slackpost(msg.SLACK_WEBHOOK_URL, data);
      } else {
        return null;
      }
    }).then(function(data) {
      console.log('hook', data);
      return;
    }).catch(function(e) {
      // bad cookie or other error
      return utils.error({ok: false, err: e});
    }); 
  } else {
    console.log('ignoring', msg.id);
  };
  
};

exports.main = main;