const cloudant = require('./lib/db.js');
const utils = require('./lib/utils.js');

const main = function(msg) {
  
  // cloudant
  const tokensdb = cloudant.configure(msg.COUCH_HOST, 'tokens');
  const db = cloudant.configure(msg.COUCH_HOST, msg.COUCH_DATABASE);
  
  // no cookie, no entry
  if (msg.cookie && msg.id && msg.rev) {

    // load cookie data
    return tokensdb.get(msg.cookie).then(function(data) {

      // add to database
      return db.destroy(msg.id, msg.rev);
    }).then(function(data) {
      // return the id,rev,ok:true
      return utils.reply(data);
    }).catch(function(e) {
      // bad cookie or other error
      return utils.error({ok: false, err: e});
    });
  } else {
    // missing cookie
    return utils.error({ok: false, err: 'not authorised'});
  }
  
};

exports.main = main;