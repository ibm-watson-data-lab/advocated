const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');

const main = function(msg) {
  
  // cloudant
  const tokensdb = cloudant.configure(msg.COUCH_HOST, 'tokens');
  const db = cloudant.configure(msg.COUCH_HOST, msg.COUCH_DATABASE);
  
  // no cookie, no entry
  if (msg.cookie) {

    // load cookie data
    return tokensdb.get(msg.cookie).then(function(data) {

      var opts = {
        startkey: [data.userid, '2099-01-01'],
        endkey: [data.userid, '1970-01-01'],
        descending: true,
        reduce: false,
        limit: 50
      };
      return db.view('report','userevents', opts);
      
    }).then(utils.reply).catch(utils.error);
  } else {
    // missing cookie
    return utils.error({ok: false, err: 'not authorised'});
  }
  
};

exports.main = main;